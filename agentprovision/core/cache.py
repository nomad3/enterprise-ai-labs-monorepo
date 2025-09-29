import hashlib
import json
from datetime import timedelta
from typing import Any, Optional

import redis


class CacheService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        # Cache entries expire after 24 hours
        self.default_ttl = timedelta(hours=24)

    def _generate_key(self, prompt: str, context: Optional[dict] = None) -> str:
        """Generate a unique cache key based on prompt and context."""
        key_data = {"prompt": prompt, "context": context or {}}
        return f"gemini:response:{hashlib.md5(json.dumps(key_data, sort_keys=True).encode()).hexdigest()}"

    async def get(self, prompt: str, context: Optional[dict] = None) -> Optional[Any]:
        """Retrieve a cached response for the given prompt and context."""
        key = self._generate_key(prompt, context)
        cached_data = self.redis.get(key)
        if cached_data:
            return json.loads(cached_data)
        return None

    async def set(
        self, prompt: str, response: Any, context: Optional[dict] = None
    ) -> None:
        """Cache a response for the given prompt and context."""
        key = self._generate_key(prompt, context)
        self.redis.setex(key, self.default_ttl, json.dumps(response))

    async def invalidate(self, prompt: str, context: Optional[dict] = None) -> None:
        """Remove a cached response."""
        key = self._generate_key(prompt, context)
        self.redis.delete(key)

    async def get_or_set(
        self, prompt: str, context: Optional[dict], generator_func
    ) -> Any:
        """Get from cache or generate and cache if not found."""
        cached_response = await self.get(prompt, context)
        if cached_response is not None:
            return cached_response

        response = await generator_func()
        await self.set(prompt, response, context)
        return response


# Create a singleton instance
cache_service = CacheService()
