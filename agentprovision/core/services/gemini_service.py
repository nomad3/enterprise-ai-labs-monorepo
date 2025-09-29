"""
Gemini Service for agentprovision
Handles code generation and analysis using Google's Gemini model
"""

import hashlib
import json
from typing import Any, Dict, Optional

import google.generativeai as genai

from ..config import settings
from ..database import get_redis


class GeminiService:
    def __init__(self):
        # Initialize Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-pro")
        self.chat = self.model.start_chat(history=[])
        self.redis = get_redis()
        self.cache_ttl = 3600  # 1 hour cache TTL

    def _generate_cache_key(self, prompt_type: str, context: Dict[str, Any]) -> str:
        """
        Generate a unique cache key for the request
        """
        # Create a deterministic string from the context
        context_str = json.dumps(context, sort_keys=True)
        # Generate a hash of the prompt type and context
        return f"gemini:{prompt_type}:{hashlib.md5(context_str.encode()).hexdigest()}"

    async def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get cached response if available
        """
        try:
            cached = await self.redis.get(cache_key)
            if cached:
                return json.loads(cached)
            return None
        except Exception:
            return None

    async def _cache_response(self, cache_key: str, response: Dict[str, Any]) -> None:
        """
        Cache the response
        """
        try:
            await self.redis.set(cache_key, json.dumps(response), ex=self.cache_ttl)
        except Exception:
            pass  # Silently fail if caching fails

    async def generate_code(
        self, prompt_type: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate code using Gemini with caching
        """
        try:
            # Generate cache key
            cache_key = self._generate_cache_key(prompt_type, context)

            # Check cache first
            cached_response = await self._get_cached_response(cache_key)
            if cached_response:
                return cached_response

            # Prepare prompt based on type
            prompt = self._prepare_prompt(prompt_type, context)

            # Generate response
            response = await self.chat.send_message(prompt)

            # Parse and validate response
            code = self._parse_response(response.text)

            # Cache the response
            await self._cache_response(cache_key, code)

            return code
        except Exception as e:
            raise Exception(f"Error generating code: {str(e)}")

    async def generate_analysis(
        self, prompt_type: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate analysis using Gemini with caching
        """
        try:
            # Generate cache key
            cache_key = self._generate_cache_key(prompt_type, context)

            # Check cache first
            cached_response = await self._get_cached_response(cache_key)
            if cached_response:
                return cached_response

            # Prepare prompt based on type
            prompt = self._prepare_analysis_prompt(prompt_type, context)

            # Generate response
            response = await self.chat.send_message(prompt)

            # Parse and validate response
            analysis = self._parse_analysis(response.text)

            # Cache the response
            await self._cache_response(cache_key, analysis)

            return analysis
        except Exception as e:
            raise Exception(f"Error generating analysis: {str(e)}")

    def _prepare_prompt(self, prompt_type: str, context: Dict[str, Any]) -> str:
        """
        Prepare prompt for code generation
        """
        if prompt_type == "terraform":
            return self._prepare_terraform_prompt(context)
        elif prompt_type == "helm_chart":
            return self._prepare_helm_prompt(context)
        else:
            raise ValueError(f"Unknown prompt type: {prompt_type}")

    def _prepare_analysis_prompt(
        self, prompt_type: str, context: Dict[str, Any]
    ) -> str:
        """
        Prepare prompt for analysis
        """
        if prompt_type == "kubernetes_troubleshooting":
            return self._prepare_kubernetes_troubleshooting_prompt(context)
        else:
            raise ValueError(f"Unknown prompt type: {prompt_type}")

    def _prepare_terraform_prompt(self, context: Dict[str, Any]) -> str:
        """
        Prepare prompt for Terraform code generation
        """
        knowledge_base = context["knowledge_base"]
        requirements = context["requirements"]

        prompt = f"""
        Generate Terraform code based on the following requirements and best practices:

        Requirements:
        {requirements}

        Best Practices:
        {knowledge_base['best_practices']}

        Available Providers:
        {knowledge_base['providers']}

        Available Modules:
        {knowledge_base['modules']}

        Use the following templates as a base:
        {knowledge_base['templates']}

        Generate complete Terraform code that follows best practices and meets the requirements.
        """

        return prompt

    def _prepare_helm_prompt(self, context: Dict[str, Any]) -> str:
        """
        Prepare prompt for Helm chart generation
        """
        knowledge_base = context["knowledge_base"]
        requirements = context["requirements"]

        prompt = f"""
        Generate a Helm chart based on the following requirements and best practices:

        Requirements:
        {requirements}

        Chart Structure:
        {knowledge_base['structure']}

        Best Practices:
        {knowledge_base['best_practices']}

        Testing Guidelines:
        {knowledge_base['testing']}

        Generate a complete Helm chart that follows best practices and meets the requirements.
        """

        return prompt

    def _prepare_kubernetes_troubleshooting_prompt(
        self, context: Dict[str, Any]
    ) -> str:
        """
        Prepare prompt for Kubernetes troubleshooting
        """
        knowledge_base = context["knowledge_base"]
        issue_description = context["issue_description"]

        prompt = f"""
        Analyze the following Kubernetes issue and provide troubleshooting steps:

        Issue Description:
        {issue_description}

        Troubleshooting Knowledge Base:
        {knowledge_base['troubleshooting']}

        Best Practices:
        {knowledge_base['best_practices']}

        Provide a detailed analysis and step-by-step troubleshooting guide.
        """

        return prompt

    def _parse_response(self, response: str) -> Dict[str, Any]:
        """
        Parse and validate Gemini response
        """
        # Implementation will parse and validate the response
        # This is a placeholder for the actual implementation
        return {"code": response}

    def _parse_analysis(self, response: str) -> Dict[str, Any]:
        """
        Parse and validate Gemini analysis response
        """
        # Implementation will parse and validate the analysis
        # This is a placeholder for the actual implementation
        return {"analysis": response}
