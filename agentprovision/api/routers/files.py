from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket
from pydantic import BaseModel

from ...core.file_manager import FileManager
from ..dependencies import get_file_manager

router = APIRouter(prefix="/files", tags=["files"])


class FileNode(BaseModel):
    name: str
    type: str
    path: str
    children: Optional[List["FileNode"]] = None


class FileContent(BaseModel):
    content: str
    language: str


class FileWrite(BaseModel):
    content: str


class FileOperation(BaseModel):
    source_path: str
    destination_path: str


class SearchResult(BaseModel):
    path: str
    name: str
    type: str


class FileComparison(BaseModel):
    added: List[str]
    removed: List[str]
    modified: List[str]


@router.get("/list/{path:path}", response_model=List[FileNode])
async def list_files(
    path: str = "", file_manager: FileManager = Depends(get_file_manager)
):
    """List files and directories in the specified path."""
    try:
        return await file_manager.list_files(path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/read/{path:path}", response_model=FileContent)
async def read_file(path: str, file_manager: FileManager = Depends(get_file_manager)):
    """Read the content of a file."""
    try:
        content, language = await file_manager.read_file(path)
        return FileContent(content=content, language=language)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/write/{path:path}")
async def write_file(
    path: str,
    file_data: FileWrite,
    file_manager: FileManager = Depends(get_file_manager),
):
    """Write content to a file."""
    try:
        await file_manager.write_file(path, file_data.content)
        return {"message": "File written successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{path:path}")
async def delete_file(path: str, file_manager: FileManager = Depends(get_file_manager)):
    """Delete a file."""
    try:
        await file_manager.delete_file(path)
        return {"message": "File deleted successfully"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mkdir/{path:path}")
async def create_directory(
    path: str, file_manager: FileManager = Depends(get_file_manager)
):
    """Create a new directory."""
    try:
        await file_manager.create_directory(path)
        return {"message": "Directory created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/copy")
async def copy_file(
    operation: FileOperation, file_manager: FileManager = Depends(get_file_manager)
):
    """Copy a file from source to destination."""
    try:
        await file_manager.copy_file(operation.source_path, operation.destination_path)
        return {"message": "File copied successfully"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/move")
async def move_file(
    operation: FileOperation, file_manager: FileManager = Depends(get_file_manager)
):
    """Move a file from source to destination."""
    try:
        await file_manager.move_file(operation.source_path, operation.destination_path)
        return {"message": "File moved successfully"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=List[SearchResult])
async def search_files(
    query: str = Query(..., description="Search query string"),
    path: str = Query("", description="Path to search in"),
    case_sensitive: bool = Query(
        False, description="Whether the search should be case sensitive"
    ),
    file_manager: FileManager = Depends(get_file_manager),
):
    """Search for files containing the query string."""
    try:
        return await file_manager.search_files(query, path, case_sensitive)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/name", response_model=List[SearchResult])
async def search_by_name(
    pattern: str = Query(..., description="File name pattern to search for"),
    path: str = Query("", description="Path to search in"),
    case_sensitive: bool = Query(
        False, description="Whether the search should be case sensitive"
    ),
    file_manager: FileManager = Depends(get_file_manager),
):
    """Search for files matching the name pattern."""
    try:
        return await file_manager.search_by_name(pattern, path, case_sensitive)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/watch/{path:path}")
async def watch_directory(
    websocket: WebSocket,
    path: str,
    file_manager: FileManager = Depends(get_file_manager),
):
    """Watch a directory for file changes."""
    try:
        await websocket.accept()

        async def notify_change(file_path: str, event_type: str):
            await websocket.send_json({"path": file_path, "event": event_type})

        await file_manager.watch_directory(path, notify_change)

        try:
            while True:
                # Keep the connection alive
                await websocket.receive_text()
        except Exception:
            # Clean up when the connection is closed
            await file_manager.unwatch_directory(path, notify_change)
    except Exception as e:
        await websocket.close(code=1000, reason=str(e))


@router.get("/compare", response_model=FileComparison)
async def compare_files(
    file1: str = Query(..., description="Path to first file"),
    file2: str = Query(..., description="Path to second file"),
    file_manager: FileManager = Depends(get_file_manager),
):
    """Compare two files and return their differences."""
    try:
        return await file_manager.compare_files(file1, file2)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
