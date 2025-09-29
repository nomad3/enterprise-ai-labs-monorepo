import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/files", tags=["files"])


class FileWriteRequest(BaseModel):
    content: str
    fileName: str
    fileType: str


class FileWriteResponse(BaseModel):
    success: bool
    message: str
    filePath: Optional[str] = None


@router.post("/write", response_model=FileWriteResponse)
async def write_file(request: FileWriteRequest):
    try:
        # Create appropriate directory based on file type
        base_dir = Path("generated")
        if request.fileType == "code":
            target_dir = base_dir / "code"
        elif request.fileType == "test":
            target_dir = base_dir / "tests"
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Ensure directory exists
        target_dir.mkdir(parents=True, exist_ok=True)

        # Create file path
        file_path = target_dir / request.fileName

        # Write content to file
        with open(file_path, "w") as f:
            f.write(request.content)

        return FileWriteResponse(
            success=True,
            message=f"Successfully wrote {request.fileType} to {file_path}",
            filePath=str(file_path),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
