from fastapi import Depends

from ..core.file_manager import FileManager


def get_file_manager() -> FileManager:
    """Get a FileManager instance."""
    return FileManager()
