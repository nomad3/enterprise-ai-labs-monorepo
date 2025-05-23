from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from devagent.core.version_control.git_service import GitService

router = APIRouter(prefix="/git", tags=["version control"])

git_service = GitService()

class BranchRequest(BaseModel):
    branch_name: str

class CommitRequest(BaseModel):
    message: str

class PushRequest(BaseModel):
    remote: str = "origin"
    branch: str = None

@router.post("/init")
def git_init():
    result = git_service.init()
    if result.startswith("Error") or result.startswith("Exception"):
        raise HTTPException(status_code=500, detail=result)
    return {"result": result}

@router.post("/branch")
def git_branch(request: BranchRequest):
    result = git_service.branch(request.branch_name)
    if result.startswith("Error") or result.startswith("Exception"):
        raise HTTPException(status_code=500, detail=result)
    return {"result": result}

@router.post("/commit")
def git_commit(request: CommitRequest):
    result = git_service.commit(request.message)
    if result.startswith("Error") or result.startswith("Exception"):
        raise HTTPException(status_code=500, detail=result)
    return {"result": result}

@router.post("/push")
def git_push(request: PushRequest):
    result = git_service.push(request.remote, request.branch)
    if result.startswith("Error") or result.startswith("Exception"):
        raise HTTPException(status_code=500, detail=result)
    return {"result": result} 