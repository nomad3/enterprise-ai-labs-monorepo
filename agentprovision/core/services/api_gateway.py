"""
API Gateway Service for agentprovision.

This service handles:
- Request routing and load balancing
- Rate limiting and throttling
- Authentication and authorization
- Request/response transformation
- Monitoring and analytics
- Circuit breaker patterns
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

import redis.asyncio as aioredis
from fastapi import HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from agentprovision.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class RateLimitRule(BaseModel):
    """Rate limiting rule configuration."""

    id: str
    name: str
    pattern: str  # URL pattern or endpoint
    requests_per_minute: int = 100
    requests_per_hour: int = 1000
    requests_per_day: int = 10000
    burst_limit: int = 10  # Allow burst requests
    tenant_specific: bool = True
    user_specific: bool = False
    enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CircuitBreakerConfig(BaseModel):
    """Circuit breaker configuration."""

    failure_threshold: int = 5  # Number of failures before opening
    recovery_timeout: int = 60  # Seconds before trying to close
    success_threshold: int = 3  # Successful requests needed to close
    timeout_seconds: int = 30  # Request timeout


class CircuitBreakerState(BaseModel):
    """Circuit breaker state."""

    service_name: str
    state: str = "closed"  # closed, open, half_open
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: Optional[datetime] = None
    last_success_time: Optional[datetime] = None


class RequestMetrics(BaseModel):
    """Request metrics."""

    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    tenant_id: Optional[int] = None
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_size_bytes: int = 0
    response_size_bytes: int = 0


class APIGateway:
    """
    API Gateway service for request management and routing.
    """

    def __init__(self):
        self.rate_limit_rules: Dict[str, RateLimitRule] = {}
        self.circuit_breakers: Dict[str, CircuitBreakerState] = {}
        self.circuit_breaker_config = CircuitBreakerConfig()
        self.redis_client: Optional[aioredis.Redis] = None
        self.request_metrics: List[RequestMetrics] = []
        self._gateway_running = False

    async def start_gateway(self):
        """Start the API gateway service."""
        self._gateway_running = True
        logger.info("API Gateway started")

        # Initialize Redis for rate limiting
        try:
            self.redis_client = aioredis.from_url(
                settings.REDIS_URL, encoding="utf-8", decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Redis connection established for API Gateway")
        except Exception as e:
            logger.warning(
                f"Redis connection failed, using in-memory rate limiting: {e}"
            )

        # Load default rate limiting rules
        await self._load_default_rules()

        # Start background tasks
        asyncio.create_task(self._cleanup_metrics())
        asyncio.create_task(self._monitor_circuit_breakers())

    async def stop_gateway(self):
        """Stop the API gateway service."""
        self._gateway_running = False

        if self.redis_client:
            await self.redis_client.close()

        logger.info("API Gateway stopped")

    async def process_request(self, request: Request) -> Optional[Response]:
        """
        Process incoming request through gateway.

        Returns None if request should proceed, Response if request should be blocked.
        """
        start_time = time.time()

        try:
            # Extract request info
            endpoint = str(request.url.path)
            method = request.method
            tenant_id = self._extract_tenant_id(request)
            user_id = self._extract_user_id(request)

            # Check circuit breaker
            if await self._is_circuit_breaker_open(endpoint):
                return Response(
                    content="Service temporarily unavailable",
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            # Check rate limits
            rate_limit_result = await self._check_rate_limits(
                endpoint, method, tenant_id, user_id
            )

            if not rate_limit_result["allowed"]:
                return Response(
                    content="Rate limit exceeded",
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={
                        "X-RateLimit-Limit": str(rate_limit_result["limit"]),
                        "X-RateLimit-Remaining": str(rate_limit_result["remaining"]),
                        "X-RateLimit-Reset": str(rate_limit_result["reset_time"]),
                    },
                )

            # Request is allowed to proceed
            return None

        except Exception as e:
            logger.error(f"Error processing request in gateway: {e}")
            # Allow request to proceed on gateway errors
            return None

    async def record_response(
        self, request: Request, response: Response, response_time_ms: float
    ):
        """Record response metrics."""
        try:
            endpoint = str(request.url.path)
            method = request.method
            tenant_id = self._extract_tenant_id(request)
            user_id = self._extract_user_id(request)

            # Record metrics
            metrics = RequestMetrics(
                endpoint=endpoint,
                method=method,
                status_code=response.status_code,
                response_time_ms=response_time_ms,
                tenant_id=tenant_id,
                user_id=user_id,
                request_size_bytes=int(request.headers.get("content-length", 0)),
                response_size_bytes=(
                    len(response.body) if hasattr(response, "body") else 0
                ),
            )

            self.request_metrics.append(metrics)

            # Update circuit breaker
            await self._update_circuit_breaker(endpoint, response.status_code >= 500)

            # Keep only recent metrics
            if len(self.request_metrics) > 10000:
                self.request_metrics = self.request_metrics[-5000:]

        except Exception as e:
            logger.error(f"Error recording response metrics: {e}")

    async def add_rate_limit_rule(self, rule: RateLimitRule):
        """Add a new rate limiting rule."""
        self.rate_limit_rules[rule.id] = rule
        logger.info(f"Added rate limit rule: {rule.name}")

    async def remove_rate_limit_rule(self, rule_id: str):
        """Remove a rate limiting rule."""
        if rule_id in self.rate_limit_rules:
            del self.rate_limit_rules[rule_id]
            logger.info(f"Removed rate limit rule: {rule_id}")

    async def get_rate_limit_rules(self) -> List[RateLimitRule]:
        """Get all rate limiting rules."""
        return list(self.rate_limit_rules.values())

    async def get_metrics(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        tenant_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Get API gateway metrics."""
        # Filter metrics
        filtered_metrics = self.request_metrics

        if start_time:
            filtered_metrics = [
                m for m in filtered_metrics if m.timestamp >= start_time
            ]

        if end_time:
            filtered_metrics = [m for m in filtered_metrics if m.timestamp <= end_time]

        if tenant_id:
            filtered_metrics = [m for m in filtered_metrics if m.tenant_id == tenant_id]

        if not filtered_metrics:
            return {
                "total_requests": 0,
                "avg_response_time_ms": 0,
                "error_rate": 0,
                "requests_per_minute": 0,
            }

        # Calculate metrics
        total_requests = len(filtered_metrics)
        avg_response_time = (
            sum(m.response_time_ms for m in filtered_metrics) / total_requests
        )
        error_count = sum(1 for m in filtered_metrics if m.status_code >= 400)
        error_rate = (error_count / total_requests) * 100

        # Calculate requests per minute
        if start_time and end_time:
            duration_minutes = (end_time - start_time).total_seconds() / 60
            requests_per_minute = total_requests / max(duration_minutes, 1)
        else:
            requests_per_minute = 0

        # Status code breakdown
        status_codes = {}
        for metric in filtered_metrics:
            status_codes[metric.status_code] = (
                status_codes.get(metric.status_code, 0) + 1
            )

        # Endpoint breakdown
        endpoints = {}
        for metric in filtered_metrics:
            endpoint = metric.endpoint
            if endpoint not in endpoints:
                endpoints[endpoint] = {
                    "count": 0,
                    "avg_response_time": 0,
                    "error_count": 0,
                }

            endpoints[endpoint]["count"] += 1
            endpoints[endpoint]["avg_response_time"] += metric.response_time_ms
            if metric.status_code >= 400:
                endpoints[endpoint]["error_count"] += 1

        # Calculate averages for endpoints
        for endpoint_data in endpoints.values():
            if endpoint_data["count"] > 0:
                endpoint_data["avg_response_time"] /= endpoint_data["count"]
                endpoint_data["error_rate"] = (
                    endpoint_data["error_count"] / endpoint_data["count"]
                ) * 100

        return {
            "total_requests": total_requests,
            "avg_response_time_ms": avg_response_time,
            "error_rate": error_rate,
            "requests_per_minute": requests_per_minute,
            "status_codes": status_codes,
            "endpoints": endpoints,
            "circuit_breakers": {
                name: state.dict() for name, state in self.circuit_breakers.items()
            },
        }

    def _extract_tenant_id(self, request: Request) -> Optional[int]:
        """Extract tenant ID from request."""
        # Try header first
        tenant_header = request.headers.get(settings.TENANT_HEADER)
        if tenant_header:
            try:
                return int(tenant_header)
            except ValueError:
                pass

        # Try from JWT token (would need to decode)
        # For now, return None
        return None

    def _extract_user_id(self, request: Request) -> Optional[str]:
        """Extract user ID from request."""
        # Would extract from JWT token
        # For now, return None
        return None

    async def _check_rate_limits(
        self,
        endpoint: str,
        method: str,
        tenant_id: Optional[int],
        user_id: Optional[str],
    ) -> Dict[str, Any]:
        """Check if request is within rate limits."""
        # Find applicable rules
        applicable_rules = []
        for rule in self.rate_limit_rules.values():
            if rule.enabled and self._rule_matches_request(rule, endpoint, method):
                applicable_rules.append(rule)

        if not applicable_rules:
            return {"allowed": True, "limit": 0, "remaining": 0, "reset_time": 0}

        # Use the most restrictive rule
        most_restrictive_rule = min(
            applicable_rules, key=lambda r: r.requests_per_minute
        )

        # Check rate limit
        if self.redis_client:
            return await self._check_redis_rate_limit(
                most_restrictive_rule, tenant_id, user_id
            )
        else:
            return await self._check_memory_rate_limit(
                most_restrictive_rule, tenant_id, user_id
            )

    def _rule_matches_request(
        self, rule: RateLimitRule, endpoint: str, method: str
    ) -> bool:
        """Check if a rule matches the current request."""
        # Simple pattern matching (could be enhanced with regex)
        return rule.pattern in endpoint or rule.pattern == "*"

    async def _check_redis_rate_limit(
        self, rule: RateLimitRule, tenant_id: Optional[int], user_id: Optional[str]
    ) -> Dict[str, Any]:
        """Check rate limit using Redis."""
        try:
            # Create key based on rule and identifiers
            key_parts = [f"rate_limit:{rule.id}"]

            if rule.tenant_specific and tenant_id:
                key_parts.append(f"tenant:{tenant_id}")

            if rule.user_specific and user_id:
                key_parts.append(f"user:{user_id}")

            key = ":".join(key_parts)

            # Use sliding window rate limiting
            now = int(time.time())
            window_start = now - 60  # 1 minute window

            # Remove old entries
            await self.redis_client.zremrangebyscore(key, 0, window_start)

            # Count current requests
            current_count = await self.redis_client.zcard(key)

            if current_count >= rule.requests_per_minute:
                return {
                    "allowed": False,
                    "limit": rule.requests_per_minute,
                    "remaining": 0,
                    "reset_time": now + 60,
                }

            # Add current request
            await self.redis_client.zadd(key, {str(uuid4()): now})
            await self.redis_client.expire(key, 60)

            return {
                "allowed": True,
                "limit": rule.requests_per_minute,
                "remaining": rule.requests_per_minute - current_count - 1,
                "reset_time": now + 60,
            }

        except Exception as e:
            logger.error(f"Redis rate limit check failed: {e}")
            # Allow request on Redis errors
            return {"allowed": True, "limit": 0, "remaining": 0, "reset_time": 0}

    async def _check_memory_rate_limit(
        self, rule: RateLimitRule, tenant_id: Optional[int], user_id: Optional[str]
    ) -> Dict[str, Any]:
        """Check rate limit using in-memory storage (fallback)."""
        # Simple in-memory rate limiting (not suitable for production)
        # This is a fallback when Redis is not available
        return {
            "allowed": True,
            "limit": rule.requests_per_minute,
            "remaining": rule.requests_per_minute,
            "reset_time": 0,
        }

    async def _is_circuit_breaker_open(self, endpoint: str) -> bool:
        """Check if circuit breaker is open for an endpoint."""
        if endpoint not in self.circuit_breakers:
            return False

        breaker = self.circuit_breakers[endpoint]

        if breaker.state == "open":
            # Check if we should try to recover
            if (
                breaker.last_failure_time
                and datetime.utcnow() - breaker.last_failure_time
                > timedelta(seconds=self.circuit_breaker_config.recovery_timeout)
            ):
                breaker.state = "half_open"
                breaker.success_count = 0
                logger.info(f"Circuit breaker for {endpoint} moved to half-open state")
            else:
                return True

        return False

    async def _update_circuit_breaker(self, endpoint: str, is_failure: bool):
        """Update circuit breaker state based on request result."""
        if endpoint not in self.circuit_breakers:
            self.circuit_breakers[endpoint] = CircuitBreakerState(service_name=endpoint)

        breaker = self.circuit_breakers[endpoint]

        if is_failure:
            breaker.failure_count += 1
            breaker.last_failure_time = datetime.utcnow()
            breaker.success_count = 0

            if (
                breaker.state == "closed"
                and breaker.failure_count
                >= self.circuit_breaker_config.failure_threshold
            ):
                breaker.state = "open"
                logger.warning(f"Circuit breaker for {endpoint} opened due to failures")
        else:
            breaker.success_count += 1
            breaker.last_success_time = datetime.utcnow()

            if breaker.state == "half_open":
                if (
                    breaker.success_count
                    >= self.circuit_breaker_config.success_threshold
                ):
                    breaker.state = "closed"
                    breaker.failure_count = 0
                    logger.info(f"Circuit breaker for {endpoint} closed after recovery")

    async def _load_default_rules(self):
        """Load default rate limiting rules."""
        default_rules = [
            RateLimitRule(
                id="default_api",
                name="Default API Rate Limit",
                pattern="*",
                requests_per_minute=100,
                requests_per_hour=1000,
                requests_per_day=10000,
            ),
            RateLimitRule(
                id="llm_generation",
                name="LLM Generation Rate Limit",
                pattern="/api/v1/llm/generate",
                requests_per_minute=20,
                requests_per_hour=200,
                requests_per_day=1000,
            ),
            RateLimitRule(
                id="agent_execution",
                name="Agent Execution Rate Limit",
                pattern="/api/v1/runtime/agents/*/execute",
                requests_per_minute=50,
                requests_per_hour=500,
                requests_per_day=2000,
            ),
        ]

        for rule in default_rules:
            await self.add_rate_limit_rule(rule)

    async def _cleanup_metrics(self):
        """Background task to cleanup old metrics."""
        while self._gateway_running:
            try:
                cutoff_time = datetime.utcnow() - timedelta(hours=24)

                # Remove metrics older than 24 hours
                self.request_metrics = [
                    m for m in self.request_metrics if m.timestamp > cutoff_time
                ]

                await asyncio.sleep(3600)  # Cleanup every hour

            except Exception as e:
                logger.error(f"Error cleaning up metrics: {e}")
                await asyncio.sleep(3600)

    async def _monitor_circuit_breakers(self):
        """Background task to monitor circuit breakers."""
        while self._gateway_running:
            try:
                for endpoint, breaker in self.circuit_breakers.items():
                    if breaker.state == "open":
                        logger.info(
                            f"Circuit breaker for {endpoint} is open (failures: {breaker.failure_count})"
                        )

                await asyncio.sleep(300)  # Check every 5 minutes

            except Exception as e:
                logger.error(f"Error monitoring circuit breakers: {e}")
                await asyncio.sleep(300)


# Global API gateway instance
api_gateway = APIGateway()


async def get_api_gateway() -> APIGateway:
    """Get the global API gateway instance."""
    return api_gateway
