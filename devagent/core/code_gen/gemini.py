import logging
import os
from typing import Optional

try:
    import google.generativeai as genai
except ImportError:
    genai = None


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        # Use the provided API key for testing
        self.api_key = (
            api_key
            or os.getenv("GEMINI_API_KEY")
            or "AIzaSyCOVwsKFiuVicKvSazEYudNhjDIPGMl8AE"
        )
        if genai and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-pro")
        else:
            self.model = None

    def generate_code(self, prompt: str) -> str:
        if self.model:
            logging.info("GeminiClient: Using real Gemini model for code generation.")
            response = self.model.generate_content(prompt)
            return response.text
        logging.info("GeminiClient: Returning mock response for code generation.")
        return f"# Gemini mock: This would be generated code for prompt: {prompt}"

    def generate_tests(self, code: str) -> str:
        prompt = f"Generate unit tests for the following code:\n\n{code}"
        if self.model:
            response = self.model.generate_content(prompt)
            return response.text
        return f"# Gemini mock: This would be generated tests for code:\n{code}"

    def troubleshoot_code(self, code: str, error: str) -> str:
        prompt = f"Troubleshoot the following code with error:\n\nCode:\n{code}\n\nError:\n{error}"
        if self.model:
            response = self.model.generate_content(prompt)
            return response.text
        return f"# Gemini mock: This would be troubleshooting for code:\n{code}\nError:\n{error}"
