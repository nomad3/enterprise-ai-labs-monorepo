from typing import Any, Dict, Optional

import google.generativeai as genai

from .cache import cache_service


class CoreService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-pro")

    async def generate_code(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate code using Gemini API with caching."""

        async def _generate():
            response = await self.model.generate_content_async(
                f"Generate Python code for: {prompt}",
                generation_config={
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "top_k": 40,
                },
            )
            return response.text

        return await cache_service.get_or_set(prompt, context, _generate)

    async def generate_tests(
        self, code: str, context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate tests using Gemini API with caching."""

        async def _generate():
            response = await self.model.generate_content_async(
                f"Generate Python unit tests for this code:\n\n{code}",
                generation_config={
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "top_k": 40,
                },
            )
            return response.text

        return await cache_service.get_or_set(code, context, _generate)

    async def generate_solution_plan(
        self, ticket_id: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a solution plan using Gemini API with caching."""

        async def _generate():
            response = await self.model.generate_content_async(
                f"Generate a solution plan for ticket {ticket_id}",
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.8,
                    "top_k": 40,
                },
            )
            return response.text

        return await cache_service.get_or_set(ticket_id, context, _generate)


# Create a singleton instance
core_service = CoreService(api_key="your-api-key-here")
