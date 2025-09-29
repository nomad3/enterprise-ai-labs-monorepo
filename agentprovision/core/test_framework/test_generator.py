from agentprovision.core.code_gen.gemini import GeminiClient


class TestGenerator:
    def __init__(self):
        self.gemini_client = GeminiClient()

    def generate_tests(self, code: str) -> str:
        return self.gemini_client.generate_tests(code)
