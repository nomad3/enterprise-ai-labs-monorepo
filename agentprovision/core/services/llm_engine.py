"""
LLM Engine Service for agentprovision.

This service handles:
- Multi-provider LLM support (OpenAI, Anthropic, Google, Azure)
- Intelligent routing based on cost, latency, and capability
- Automatic failover and retry mechanisms
- Token usage tracking and optimization
- Model fine-tuning and customization
- Request caching and optimization
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

import aiohttp
import google.generativeai as genai
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from agentprovision.core.config import get_settings
from agentprovision.core.database import get_session

logger = logging.getLogger(__name__)
settings = get_settings()


class LLMProvider(str, Enum):
    """Supported LLM providers."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE = "azure"
    CUSTOM = "custom"


class ModelCapability(str, Enum):
    """Model capabilities."""

    TEXT_GENERATION = "text_generation"
    CODE_GENERATION = "code_generation"
    ANALYSIS = "analysis"
    REASONING = "reasoning"
    MULTIMODAL = "multimodal"
    FUNCTION_CALLING = "function_calling"


class RequestPriority(str, Enum):
    """Request priority levels."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class LLMModel(BaseModel):
    """LLM model configuration."""

    id: str
    provider: LLMProvider
    name: str
    display_name: str
    capabilities: List[ModelCapability]
    max_tokens: int
    cost_per_1k_tokens: float
    avg_latency_ms: float = 0.0
    availability: float = 99.9  # percentage
    context_window: int = 4096
    supports_streaming: bool = True
    supports_functions: bool = False
    is_active: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LLMRequest(BaseModel):
    """LLM request model."""

    id: UUID = Field(default_factory=uuid4)
    tenant_id: int
    user_id: Optional[str] = None
    model_preference: Optional[str] = None
    prompt: str
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: float = 0.7
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    stop_sequences: List[str] = Field(default_factory=list)
    functions: Optional[List[Dict[str, Any]]] = None
    priority: RequestPriority = RequestPriority.NORMAL
    required_capabilities: List[ModelCapability] = Field(default_factory=list)
    cost_limit: Optional[float] = None
    timeout_seconds: int = 30
    stream: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LLMResponse(BaseModel):
    """LLM response model."""

    request_id: UUID
    model_used: str
    provider_used: LLMProvider
    content: str
    finish_reason: str
    usage: Dict[str, int]
    cost: float
    latency_ms: float
    cached: bool = False
    function_calls: Optional[List[Dict[str, Any]]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LLMUsageMetrics(BaseModel):
    """LLM usage metrics."""

    tenant_id: int
    period: str  # e.g., "2024-03"
    total_requests: int = 0
    total_tokens: int = 0
    total_cost: float = 0.0
    avg_latency_ms: float = 0.0
    success_rate: float = 100.0
    provider_breakdown: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    model_breakdown: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    capability_breakdown: Dict[str, Dict[str, Any]] = Field(default_factory=dict)


class LLMProvider_Base:
    """Base class for LLM providers."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.client = None
        self.is_initialized = False

    async def initialize(self) -> bool:
        """Initialize the provider."""
        self.is_initialized = True
        return True

    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response from the model."""
        raise NotImplementedError

    async def stream_generate(self, request: LLMRequest):
        """Stream generate response from the model."""
        raise NotImplementedError

    async def health_check(self) -> bool:
        """Check if the provider is healthy."""
        return self.is_initialized

    async def get_models(self) -> List[LLMModel]:
        """Get available models from this provider."""
        return []

    async def cleanup(self):
        """Cleanup resources."""
        if self.client:
            await self.client.aclose()


class OpenAIProvider(LLMProvider_Base):
    """OpenAI provider implementation."""

    async def initialize(self) -> bool:
        """Initialize OpenAI provider."""
        api_key = self.config.get("api_key")
        if not api_key:
            logger.error("OpenAI API key not provided")
            return False

        self.client = aiohttp.ClientSession(
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=aiohttp.ClientTimeout(total=60),
        )
        self.is_initialized = True
        return True

    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response using OpenAI API."""
        start_time = time.time()

        payload = {
            "model": request.model_preference or "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": request.system_prompt or "You are a helpful assistant.",
                },
                {"role": "user", "content": request.prompt},
            ],
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p,
            "frequency_penalty": request.frequency_penalty,
            "presence_penalty": request.presence_penalty,
            "stop": request.stop_sequences if request.stop_sequences else None,
        }

        if request.functions:
            payload["functions"] = request.functions

        try:
            async with self.client.post(
                "https://api.openai.com/v1/chat/completions", json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(
                        f"OpenAI API error: {response.status} - {error_text}"
                    )

                result = await response.json()
                latency_ms = (time.time() - start_time) * 1000

                choice = result["choices"][0]
                usage = result["usage"]

                # Calculate cost (approximate)
                cost = (
                    usage["total_tokens"] / 1000
                ) * 0.002  # $0.002 per 1K tokens for GPT-3.5

                return LLMResponse(
                    request_id=request.id,
                    model_used=result["model"],
                    provider_used=LLMProvider.OPENAI,
                    content=choice["message"]["content"],
                    finish_reason=choice["finish_reason"],
                    usage=usage,
                    cost=cost,
                    latency_ms=latency_ms,
                    function_calls=choice["message"].get("function_call"),
                )

        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            raise

    async def get_models(self) -> List[LLMModel]:
        """Get OpenAI models."""
        return [
            LLMModel(
                id="gpt-4",
                provider=LLMProvider.OPENAI,
                name="gpt-4",
                display_name="GPT-4",
                capabilities=[
                    ModelCapability.TEXT_GENERATION,
                    ModelCapability.CODE_GENERATION,
                    ModelCapability.REASONING,
                ],
                max_tokens=8192,
                cost_per_1k_tokens=0.03,
                context_window=8192,
                supports_functions=True,
            ),
            LLMModel(
                id="gpt-3.5-turbo",
                provider=LLMProvider.OPENAI,
                name="gpt-3.5-turbo",
                display_name="GPT-3.5 Turbo",
                capabilities=[
                    ModelCapability.TEXT_GENERATION,
                    ModelCapability.CODE_GENERATION,
                ],
                max_tokens=4096,
                cost_per_1k_tokens=0.002,
                context_window=4096,
                supports_functions=True,
            ),
        ]


class GoogleProvider(LLMProvider_Base):
    """Google Gemini provider implementation."""

    async def initialize(self) -> bool:
        """Initialize Google provider."""
        api_key = self.config.get("api_key")
        if not api_key:
            logger.error("Google API key not provided")
            return False

        genai.configure(api_key=api_key)
        self.is_initialized = True
        return True

    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response using Google Gemini API."""
        start_time = time.time()

        try:
            model = genai.GenerativeModel(request.model_preference or "gemini-pro")

            # Combine system and user prompts
            full_prompt = (
                f"{request.system_prompt}\n\n{request.prompt}"
                if request.system_prompt
                else request.prompt
            )

            response = await model.generate_content_async(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=request.max_tokens,
                    temperature=request.temperature,
                    top_p=request.top_p,
                    stop_sequences=(
                        request.stop_sequences if request.stop_sequences else None
                    ),
                ),
            )

            latency_ms = (time.time() - start_time) * 1000

            # Estimate usage and cost
            usage = {
                # Rough estimate
                "prompt_tokens": len(full_prompt.split()) * 1.3,
                "completion_tokens": len(response.text.split()) * 1.3,
                "total_tokens": 0,
            }
            usage["total_tokens"] = usage["prompt_tokens"] + usage["completion_tokens"]

            cost = (usage["total_tokens"] / 1000) * 0.001  # Estimated cost

            return LLMResponse(
                request_id=request.id,
                model_used=request.model_preference or "gemini-pro",
                provider_used=LLMProvider.GOOGLE,
                content=response.text,
                finish_reason="stop",
                usage=usage,
                cost=cost,
                latency_ms=latency_ms,
            )

        except Exception as e:
            logger.error(f"Google generation failed: {e}")
            raise

    async def get_models(self) -> List[LLMModel]:
        """Get Google models."""
        return [
            LLMModel(
                id="gemini-pro",
                provider=LLMProvider.GOOGLE,
                name="gemini-pro",
                display_name="Gemini Pro",
                capabilities=[
                    ModelCapability.TEXT_GENERATION,
                    ModelCapability.CODE_GENERATION,
                    ModelCapability.REASONING,
                ],
                max_tokens=8192,
                cost_per_1k_tokens=0.001,
                context_window=32768,
            ),
            LLMModel(
                id="gemini-pro-vision",
                provider=LLMProvider.GOOGLE,
                name="gemini-pro-vision",
                display_name="Gemini Pro Vision",
                capabilities=[
                    ModelCapability.TEXT_GENERATION,
                    ModelCapability.MULTIMODAL,
                ],
                max_tokens=8192,
                cost_per_1k_tokens=0.001,
                context_window=32768,
            ),
        ]


class LLMEngine:
    """
    Core LLM Engine for managing multiple providers and intelligent routing.
    """

    def __init__(self):
        self.providers: Dict[LLMProvider, LLMProvider_Base] = {}
        self.models: Dict[str, LLMModel] = {}
        self.request_cache: Dict[str, LLMResponse] = {}
        self.usage_metrics: Dict[int, LLMUsageMetrics] = {}
        self.routing_strategy = "balanced"  # balanced, cost, performance, availability
        self._engine_running = False

    async def start_engine(self):
        """Start the LLM engine."""
        self._engine_running = True
        logger.info("LLM Engine started")

        # Initialize providers
        await self._initialize_providers()

        # Start background tasks
        asyncio.create_task(self._update_model_metrics())
        asyncio.create_task(self._cleanup_cache())

    async def stop_engine(self):
        """Stop the LLM engine."""
        self._engine_running = False

        # Cleanup providers
        for provider in self.providers.values():
            await provider.cleanup()

        logger.info("LLM Engine stopped")

    async def _initialize_providers(self):
        """Initialize all configured providers."""
        # OpenAI
        if settings.OPENAI_API_KEY:
            openai_provider = OpenAIProvider({"api_key": settings.OPENAI_API_KEY})
            if await openai_provider.initialize():
                self.providers[LLMProvider.OPENAI] = openai_provider
                models = await openai_provider.get_models()
                for model in models:
                    self.models[model.id] = model
                logger.info("OpenAI provider initialized")

        # Google
        if settings.GOOGLE_API_KEY:
            google_provider = GoogleProvider({"api_key": settings.GOOGLE_API_KEY})
            if await google_provider.initialize():
                self.providers[LLMProvider.GOOGLE] = google_provider
                models = await google_provider.get_models()
                for model in models:
                    self.models[model.id] = model
                logger.info("Google provider initialized")

    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response with intelligent routing."""
        # Check cache first
        cache_key = self._generate_cache_key(request)
        if cache_key in self.request_cache:
            cached_response = self.request_cache[cache_key]
            cached_response.cached = True
            logger.info(f"Returning cached response for request {request.id}")
            return cached_response

        # Select best model and provider
        model, provider = await self._select_model_and_provider(request)

        if not model or not provider:
            raise Exception("No suitable model/provider found for request")

        # Update request with selected model
        request.model_preference = model.id

        try:
            # Generate response
            response = await provider.generate(request)

            # Cache response if appropriate
            if self._should_cache_response(request, response):
                self.request_cache[cache_key] = response

            # Update metrics
            await self._update_usage_metrics(request, response)

            logger.info(
                f"Generated response using {model.id} from {provider.__class__.__name__}"
            )
            return response

        except Exception as e:
            logger.error(f"Generation failed with {model.id}: {e}")

            # Try fallback model
            fallback_response = await self._try_fallback(request, model)
            if fallback_response:
                return fallback_response

            raise

    async def stream_generate(self, request: LLMRequest):
        """Stream generate response."""
        model, provider = await self._select_model_and_provider(request)

        if not model or not provider:
            raise Exception("No suitable model/provider found for request")

        request.model_preference = model.id

        async for chunk in provider.stream_generate(request):
            yield chunk

    async def _select_model_and_provider(
        self, request: LLMRequest
    ) -> tuple[Optional[LLMModel], Optional[LLMProvider_Base]]:
        """Select the best model and provider for the request."""
        # Filter models by capabilities
        suitable_models = []

        for model in self.models.values():
            if not model.is_active:
                continue

            # Check if model has required capabilities
            if request.required_capabilities:
                if not all(
                    cap in model.capabilities for cap in request.required_capabilities
                ):
                    continue

            # Check cost limit
            if request.cost_limit:
                estimated_cost = (
                    (request.max_tokens or 1000) / 1000 * model.cost_per_1k_tokens
                )
                if estimated_cost > request.cost_limit:
                    continue

            # Check if provider is available
            provider = self.providers.get(model.provider)
            if not provider or not await provider.health_check():
                continue

            suitable_models.append(model)

        if not suitable_models:
            return None, None

        # Select based on routing strategy
        selected_model = self._apply_routing_strategy(suitable_models, request)
        selected_provider = self.providers[selected_model.provider]

        return selected_model, selected_provider

    def _apply_routing_strategy(
        self, models: List[LLMModel], request: LLMRequest
    ) -> LLMModel:
        """Apply routing strategy to select the best model."""
        if self.routing_strategy == "cost":
            return min(models, key=lambda m: m.cost_per_1k_tokens)
        elif self.routing_strategy == "performance":
            return min(models, key=lambda m: m.avg_latency_ms)
        elif self.routing_strategy == "availability":
            return max(models, key=lambda m: m.availability)
        else:  # balanced
            # Score based on cost, performance, and availability
            def score_model(model):
                cost_score = 1.0 / (model.cost_per_1k_tokens + 0.001)
                perf_score = 1.0 / (model.avg_latency_ms + 100)
                avail_score = model.availability / 100.0
                return cost_score * 0.3 + perf_score * 0.4 + avail_score * 0.3

            return max(models, key=score_model)

    async def _try_fallback(
        self, request: LLMRequest, failed_model: LLMModel
    ) -> Optional[LLMResponse]:
        """Try fallback models if primary fails."""
        # Get alternative models with same capabilities
        fallback_models = [
            model
            for model in self.models.values()
            if (
                model.id != failed_model.id
                and model.is_active
                and all(
                    cap in model.capabilities for cap in request.required_capabilities
                )
            )
        ]

        for model in fallback_models[:2]:  # Try up to 2 fallbacks
            provider = self.providers.get(model.provider)
            if provider and await provider.health_check():
                try:
                    request.model_preference = model.id
                    response = await provider.generate(request)
                    logger.info(f"Fallback successful with {model.id}")
                    return response
                except Exception as e:
                    logger.error(f"Fallback failed with {model.id}: {e}")
                    continue

        return None

    def _generate_cache_key(self, request: LLMRequest) -> str:
        """Generate cache key for request."""
        key_data = {
            "prompt": request.prompt,
            "system_prompt": request.system_prompt,
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
        }
        return f"llm_cache_{hash(json.dumps(key_data, sort_keys=True))}"

    def _should_cache_response(
        self, request: LLMRequest, response: LLMResponse
    ) -> bool:
        """Determine if response should be cached."""
        # Cache deterministic responses (low temperature)
        return request.temperature < 0.3 and response.finish_reason == "stop"

    async def _update_usage_metrics(self, request: LLMRequest, response: LLMResponse):
        """Update usage metrics for tenant."""
        tenant_id = request.tenant_id

        if tenant_id not in self.usage_metrics:
            self.usage_metrics[tenant_id] = LLMUsageMetrics(
                tenant_id=tenant_id, period=datetime.utcnow().strftime("%Y-%m")
            )

        metrics = self.usage_metrics[tenant_id]
        metrics.total_requests += 1
        metrics.total_tokens += response.usage.get("total_tokens", 0)
        metrics.total_cost += response.cost

        # Update averages
        metrics.avg_latency_ms = (
            metrics.avg_latency_ms * (metrics.total_requests - 1) + response.latency_ms
        ) / metrics.total_requests

    async def _update_model_metrics(self):
        """Background task to update model performance metrics."""
        while self._engine_running:
            try:
                # Update model latency and availability metrics
                for model in self.models.values():
                    provider = self.providers.get(model.provider)
                    if provider:
                        is_healthy = await provider.health_check()
                        model.availability = 99.9 if is_healthy else 0.0

                await asyncio.sleep(300)  # Update every 5 minutes

            except Exception as e:
                logger.error(f"Error updating model metrics: {e}")
                await asyncio.sleep(600)

    async def _cleanup_cache(self):
        """Background task to cleanup old cache entries."""
        while self._engine_running:
            try:
                # Remove cache entries older than 1 hour
                cutoff_time = datetime.utcnow() - timedelta(hours=1)

                keys_to_remove = []
                for key, response in self.request_cache.items():
                    if response.created_at < cutoff_time:
                        keys_to_remove.append(key)

                for key in keys_to_remove:
                    del self.request_cache[key]

                logger.info(f"Cleaned up {len(keys_to_remove)} cache entries")
                await asyncio.sleep(3600)  # Cleanup every hour

            except Exception as e:
                logger.error(f"Error cleaning up cache: {e}")
                await asyncio.sleep(3600)

    async def get_available_models(self) -> List[LLMModel]:
        """Get all available models."""
        return list(self.models.values())

    async def get_tenant_usage(self, tenant_id: int) -> Optional[LLMUsageMetrics]:
        """Get usage metrics for a tenant."""
        return self.usage_metrics.get(tenant_id)

    async def set_routing_strategy(self, strategy: str):
        """Set the routing strategy."""
        if strategy in ["balanced", "cost", "performance", "availability"]:
            self.routing_strategy = strategy
            logger.info(f"Routing strategy set to: {strategy}")
        else:
            raise ValueError(f"Invalid routing strategy: {strategy}")


# Global LLM engine instance
llm_engine = LLMEngine()


async def get_llm_engine() -> LLMEngine:
    """Get the global LLM engine instance."""
    return llm_engine
