"""
Infrastructure as Code Service for DevAgent
Integrates Terraform, Kubernetes, and Helm capabilities
"""

import hashlib
import json
from typing import Any, Dict, Optional

from ..database import get_redis
from ..knowledge.helm_knowledge import (
    HELM_BEST_PRACTICES,
    HELM_CHART_STRUCTURE,
    HELM_TESTING,
)
from ..knowledge.kubernetes_knowledge import (
    KUBERNETES_BEST_PRACTICES,
    KUBERNETES_TROUBLESHOOTING,
)
from ..knowledge.terraform_knowledge import (
    TERRAFORM_BEST_PRACTICES,
    TERRAFORM_MODULES,
    TERRAFORM_PROVIDERS,
    TERRAFORM_TEMPLATES,
)
from ..services.gemini_service import GeminiService


class IACService:
    def __init__(self):
        self.gemini = GeminiService()
        self.redis = get_redis()
        self.cache_ttl = 3600  # 1 hour cache TTL
        self.terraform_knowledge = {
            "providers": TERRAFORM_PROVIDERS,
            "modules": TERRAFORM_MODULES,
            "best_practices": TERRAFORM_BEST_PRACTICES,
            "templates": TERRAFORM_TEMPLATES,
        }
        self.kubernetes_knowledge = {
            "troubleshooting": KUBERNETES_TROUBLESHOOTING,
            "best_practices": KUBERNETES_BEST_PRACTICES,
        }
        self.helm_knowledge = {
            "structure": HELM_CHART_STRUCTURE,
            "best_practices": HELM_BEST_PRACTICES,
            "testing": HELM_TESTING,
        }

    def _generate_cache_key(self, operation: str, data: Dict[str, Any]) -> str:
        """
        Generate a unique cache key for the operation
        """
        # Create a deterministic string from the data
        data_str = json.dumps(data, sort_keys=True)
        # Generate a hash of the operation and data
        return f"iac:{operation}:{hashlib.md5(data_str.encode()).hexdigest()}"

    async def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get cached result if available
        """
        try:
            cached = await self.redis.get(cache_key)
            if cached:
                return json.loads(cached)
            return None
        except Exception:
            return None

    async def _cache_result(self, cache_key: str, result: Dict[str, Any]) -> None:
        """
        Cache the result
        """
        try:
            await self.redis.set(cache_key, json.dumps(result), ex=self.cache_ttl)
        except Exception:
            pass  # Silently fail if caching fails

    async def generate_terraform(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate Terraform code based on requirements using Gemini
        """
        try:
            # Generate cache key
            cache_key = self._generate_cache_key("terraform", requirements)

            # Check cache first
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                return cached_result

            # Prepare context for Gemini
            context = {
                "knowledge_base": self.terraform_knowledge,
                "requirements": requirements,
            }

            # Generate code using Gemini
            terraform_code = await self.gemini.generate_code(
                prompt_type="terraform", context=context
            )

            # Validate generated code
            validation_results = await self._validate_terraform(terraform_code)

            result = {
                "status": "success",
                "code": terraform_code,
                "validation": validation_results,
            }

            # Cache the result
            await self._cache_result(cache_key, result)

            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def troubleshoot_kubernetes(self, issue_description: str) -> Dict[str, Any]:
        """
        Analyze and troubleshoot Kubernetes issues using Gemini
        """
        try:
            # Generate cache key
            cache_key = self._generate_cache_key(
                "kubernetes", {"issue": issue_description}
            )

            # Check cache first
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                return cached_result

            # Prepare context for Gemini
            context = {
                "knowledge_base": self.kubernetes_knowledge,
                "issue_description": issue_description,
            }

            # Generate analysis using Gemini
            analysis = await self.gemini.generate_analysis(
                prompt_type="kubernetes_troubleshooting", context=context
            )

            result = {"status": "success", "analysis": analysis}

            # Cache the result
            await self._cache_result(cache_key, result)

            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def generate_helm_chart(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate Helm chart based on requirements using Gemini
        """
        try:
            # Generate cache key
            cache_key = self._generate_cache_key("helm", requirements)

            # Check cache first
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                return cached_result

            # Prepare context for Gemini
            context = {
                "knowledge_base": self.helm_knowledge,
                "requirements": requirements,
            }

            # Generate chart using Gemini
            chart = await self.gemini.generate_code(
                prompt_type="helm_chart", context=context
            )

            # Validate and test chart
            validation_results = await self._validate_helm_chart(chart)
            test_results = await self._test_helm_chart(chart)

            result = {
                "status": "success",
                "chart": chart,
                "validation": validation_results,
                "tests": test_results,
            }

            # Cache the result
            await self._cache_result(cache_key, result)

            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def _validate_terraform(self, code: str) -> Dict[str, Any]:
        """
        Validate Terraform code
        """
        # Generate cache key
        cache_key = self._generate_cache_key("terraform_validate", {"code": code})

        # Check cache first
        cached_result = await self._get_cached_result(cache_key)
        if cached_result:
            return cached_result

        # Implementation will use terraform validate and custom checks
        validation_result = {}  # Placeholder for actual implementation

        # Cache the result
        await self._cache_result(cache_key, validation_result)

        return validation_result

    async def _validate_helm_chart(self, chart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate Helm chart
        """
        # Generate cache key
        cache_key = self._generate_cache_key("helm_validate", chart)

        # Check cache first
        cached_result = await self._get_cached_result(cache_key)
        if cached_result:
            return cached_result

        # Implementation will use helm lint and custom checks
        validation_result = {}  # Placeholder for actual implementation

        # Cache the result
        await self._cache_result(cache_key, validation_result)

        return validation_result

    async def _test_helm_chart(self, chart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test Helm chart
        """
        # Generate cache key
        cache_key = self._generate_cache_key("helm_test", chart)

        # Check cache first
        cached_result = await self._get_cached_result(cache_key)
        if cached_result:
            return cached_result

        # Implementation will use helm test and custom checks
        test_result = {}  # Placeholder for actual implementation

        # Cache the result
        await self._cache_result(cache_key, test_result)

        return test_result

    async def process_iac_request(
        self, request_type: str, requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process IaC generation request
        """
        if request_type == "terraform":
            return await self.generate_terraform(requirements)
        elif request_type == "kubernetes":
            return await self.troubleshoot_kubernetes(
                requirements.get("issue_description", "")
            )
        elif request_type == "helm":
            return await self.generate_helm_chart(requirements)
        else:
            return {
                "status": "error",
                "message": f"Unknown request type: {request_type}",
            }
