from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agentprovision.core.code_gen.gemini import GeminiClient

router = APIRouter(prefix="/code", tags=["code generation"])

gemini_client = GeminiClient()


class CodeGenRequest(BaseModel):
    prompt: str


class CodeGenResponse(BaseModel):
    code: str


class TestGenRequest(BaseModel):
    code: str


class TestGenResponse(BaseModel):
    tests: str


class TroubleshootRequest(BaseModel):
    code: str
    error: str


class TroubleshootResponse(BaseModel):
    solution: str


@router.post("/generate", response_model=CodeGenResponse)
def generate_code(request: CodeGenRequest):
    try:
        code = gemini_client.generate_code(request.prompt)
        return CodeGenResponse(code=code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")


@router.post("/generate-tests", response_model=TestGenResponse)
def generate_tests(request: TestGenRequest):
    try:
        tests = gemini_client.generate_tests(request.code)
        return TestGenResponse(tests=tests)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test generation failed: {str(e)}")


@router.post("/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot_code(request: TroubleshootRequest):
    try:
        solution = gemini_client.troubleshoot_code(request.code, request.error)
        return TroubleshootResponse(solution=solution)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Troubleshooting failed: {str(e)}")
