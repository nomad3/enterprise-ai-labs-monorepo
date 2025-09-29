from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agentprovision.core.test_framework.test_generator import TestGenerator
from agentprovision.core.test_framework.test_runner import TestRunner

router = APIRouter(prefix="/test", tags=["test generation"])

test_generator = TestGenerator()
test_runner = TestRunner()


class TestGenRequest(BaseModel):
    code: str


class TestGenResponse(BaseModel):
    tests: str


class TestRunRequest(BaseModel):
    code: str
    tests: str


class TestRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: str


@router.post("/generate", response_model=TestGenResponse)
def generate_tests(request: TestGenRequest):
    try:
        tests = test_generator.generate_tests(request.code)
        return TestGenResponse(tests=tests)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test generation failed: {str(e)}")


@router.post("/run", response_model=TestRunResponse)
def run_tests(request: TestRunRequest):
    try:
        result = test_runner.run_tests(request.code, request.tests)
        return TestRunResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test run failed: {str(e)}")
