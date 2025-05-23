from fastapi import APIRouter, HTTPException
from devagent.core.ci_cd.pipeline import PipelineService

router = APIRouter(prefix="/pipeline", tags=["CI/CD"])

pipeline_service = PipelineService()

@router.post("/build")
def build():
    result = pipeline_service.build()
    return {"result": result}

@router.post("/test")
def test():
    result = pipeline_service.test()
    return {"result": result}

@router.post("/deploy")
def deploy():
    result = pipeline_service.deploy()
    return {"result": result} 