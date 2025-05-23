import asyncio
import mimetypes
import os
import re
import shutil
import time
from pathlib import Path
from typing import Callable, Dict, List, Optional, Set, Tuple

import aiofiles
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

from .config import settings


class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, callback: Callable[[str, str], None]):
        self.callback = callback
        self.last_modified: Dict[str, float] = {}

    def on_modified(self, event: FileSystemEvent):
        if event.is_directory:
            return

        path = event.src_path
        current_time = time.time()

        # Debounce rapid file changes
        if path in self.last_modified and current_time - self.last_modified[path] < 0.5:
            return

        self.last_modified[path] = current_time
        self.callback(path, "modified")

    def on_created(self, event: FileSystemEvent):
        if event.is_directory:
            return
        self.callback(event.src_path, "created")

    def on_deleted(self, event: FileSystemEvent):
        if event.is_directory:
            return
        self.callback(event.src_path, "deleted")


class FileManager:
    def __init__(self):
        self.base_path = Path(settings.WORKSPACE_ROOT)
        self.allowed_extensions = {
            # Programming languages
            ".py",
            ".js",
            ".ts",
            ".jsx",
            ".tsx",
            ".java",
            ".cs",
            ".php",
            ".rb",
            ".go",
            ".rs",
            ".swift",
            ".kt",
            # Web technologies
            ".html",
            ".css",
            ".scss",
            ".xml",
            ".json",
            ".yaml",
            ".yml",
            ".toml",
            # Shell and config
            ".sh",
            ".bash",
            ".zsh",
            ".dockerfile",
            ".gitignore",
            ".ini",
            ".conf",
            ".properties",
            # Database
            ".sql",
            ".mongodb",
            # Documentation
            ".md",
            ".txt",
            ".rst",
            # Other
            ".env",
            ".lock",
            ".log",
        }
        self.observer = None
        self.watched_paths: Set[str] = set()
        self.change_callbacks: Dict[str, List[Callable[[str, str], None]]] = {}

    async def watch_directory(
        self, path: str, callback: Callable[[str, str], None]
    ) -> None:
        """Start watching a directory for file changes."""
        try:
            watch_path = self.base_path / path
            if not watch_path.exists():
                raise FileNotFoundError(f"Path not found: {path}")

            if not watch_path.is_dir():
                raise ValueError(f"Path is not a directory: {path}")

            str_path = str(watch_path)
            if str_path not in self.change_callbacks:
                self.change_callbacks[str_path] = []

            self.change_callbacks[str_path].append(callback)

            if str_path not in self.watched_paths:
                if self.observer is None:
                    self.observer = Observer()
                    self.observer.start()

                handler = FileChangeHandler(lambda p, e: self._notify_callbacks(p, e))
                self.observer.schedule(handler, str_path, recursive=True)
                self.watched_paths.add(str_path)

        except Exception as e:
            raise Exception(f"Error watching directory: {str(e)}")

    async def unwatch_directory(
        self, path: str, callback: Optional[Callable[[str, str], None]] = None
    ) -> None:
        """Stop watching a directory for file changes."""
        try:
            watch_path = self.base_path / path
            str_path = str(watch_path)

            if str_path in self.change_callbacks:
                if callback:
                    self.change_callbacks[str_path].remove(callback)
                    if not self.change_callbacks[str_path]:
                        del self.change_callbacks[str_path]
                else:
                    del self.change_callbacks[str_path]

                if str_path in self.watched_paths and not self.change_callbacks.get(
                    str_path
                ):
                    self.observer.unschedule_all()
                    self.watched_paths.remove(str_path)

                    if not self.watched_paths and self.observer:
                        self.observer.stop()
                        self.observer = None

        except Exception as e:
            raise Exception(f"Error unwatching directory: {str(e)}")

    def _notify_callbacks(self, path: str, event_type: str) -> None:
        """Notify all callbacks about a file change."""
        try:
            relative_path = str(Path(path).relative_to(self.base_path))
            for watch_path, callbacks in self.change_callbacks.items():
                if relative_path.startswith(watch_path):
                    for callback in callbacks:
                        asyncio.create_task(callback(relative_path, event_type))
        except Exception as e:
            print(f"Error notifying callbacks: {str(e)}")

    async def compare_files(
        self, file1_path: str, file2_path: str
    ) -> Dict[str, List[str]]:
        """Compare two files and return their differences."""
        try:
            content1, _ = await self.read_file(file1_path)
            content2, _ = await self.read_file(file2_path)

            lines1 = content1.splitlines()
            lines2 = content2.splitlines()

            added = []
            removed = []
            modified = []

            # Find added and modified lines
            for i, line in enumerate(lines2):
                if i >= len(lines1):
                    added.append(line)
                elif line != lines1[i]:
                    modified.append(f"Line {i + 1}: {lines1[i]} -> {line}")

            # Find removed lines
            for i, line in enumerate(lines1):
                if i >= len(lines2):
                    removed.append(line)

            return {"added": added, "removed": removed, "modified": modified}
        except Exception as e:
            raise Exception(f"Error comparing files: {str(e)}")

    async def list_files(self, path: str = "") -> List[dict]:
        """List files and directories in the specified path."""
        try:
            full_path = self.base_path / path
            if not full_path.exists():
                raise FileNotFoundError(f"Path not found: {path}")

            result = []
            for item in full_path.iterdir():
                if item.is_file() and item.suffix not in self.allowed_extensions:
                    continue

                node = {
                    "name": item.name,
                    "type": "directory" if item.is_dir() else "file",
                    "path": str(item.relative_to(self.base_path)),
                }

                if item.is_dir():
                    node["children"] = await self.list_files(
                        str(item.relative_to(self.base_path))
                    )

                result.append(node)

            return sorted(
                result, key=lambda x: (x["type"] == "file", x["name"].lower())
            )
        except Exception as e:
            raise Exception(f"Error listing files: {str(e)}")

    async def read_file(self, file_path: str) -> Tuple[str, str]:
        """Read the content of a file and detect its language."""
        try:
            full_path = self.base_path / file_path
            if not full_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            if not full_path.is_file():
                raise ValueError(f"Path is not a file: {file_path}")

            if full_path.suffix not in self.allowed_extensions:
                raise ValueError(f"File type not allowed: {file_path}")

            async with aiofiles.open(full_path, "r", encoding="utf-8") as f:
                content = await f.read()

            language = self._detect_language(file_path)
            return content, language
        except Exception as e:
            raise Exception(f"Error reading file: {str(e)}")

    async def write_file(self, file_path: str, content: str) -> None:
        """Write content to a file."""
        try:
            full_path = self.base_path / file_path
            if full_path.suffix not in self.allowed_extensions:
                raise ValueError(f"File type not allowed: {file_path}")

            # Create parent directories if they don't exist
            full_path.parent.mkdir(parents=True, exist_ok=True)

            async with aiofiles.open(full_path, "w", encoding="utf-8") as f:
                await f.write(content)
        except Exception as e:
            raise Exception(f"Error writing file: {str(e)}")

    async def delete_file(self, file_path: str) -> None:
        """Delete a file."""
        try:
            full_path = self.base_path / file_path
            if not full_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            if not full_path.is_file():
                raise ValueError(f"Path is not a file: {file_path}")

            await asyncio.to_thread(os.remove, full_path)
        except Exception as e:
            raise Exception(f"Error deleting file: {str(e)}")

    async def create_directory(self, dir_path: str) -> None:
        """Create a new directory."""
        try:
            full_path = self.base_path / dir_path
            if full_path.exists():
                raise ValueError(f"Directory already exists: {dir_path}")

            full_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise Exception(f"Error creating directory: {str(e)}")

    def _detect_language(self, file_path: str) -> str:
        """Detect the programming language based on file extension."""
        extension = Path(file_path).suffix.lower()
        language_map = {
            # Programming languages
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".jsx": "jsx",
            ".tsx": "tsx",
            ".java": "java",
            ".cs": "csharp",
            ".php": "php",
            ".rb": "ruby",
            ".go": "go",
            ".rs": "rust",
            ".swift": "swift",
            ".kt": "kotlin",
            # Web technologies
            ".html": "html",
            ".css": "css",
            ".scss": "scss",
            ".xml": "xml",
            ".json": "json",
            ".yaml": "yaml",
            ".yml": "yaml",
            ".toml": "toml",
            # Shell and config
            ".sh": "bash",
            ".bash": "bash",
            ".zsh": "bash",
            ".dockerfile": "docker",
            ".gitignore": "git",
            ".ini": "ini",
            ".conf": "ini",
            ".properties": "properties",
            # Database
            ".sql": "sql",
            ".mongodb": "mongodb",
            # Documentation
            ".md": "markdown",
            ".txt": "plaintext",
            ".rst": "rst",
            # Other
            ".env": "plaintext",
            ".lock": "json",
            ".log": "plaintext",
        }
        return language_map.get(extension, "plaintext")

    async def copy_file(self, source_path: str, destination_path: str) -> None:
        """Copy a file from source to destination."""
        try:
            source = self.base_path / source_path
            destination = self.base_path / destination_path

            if not source.exists():
                raise FileNotFoundError(f"Source file not found: {source_path}")

            if not source.is_file():
                raise ValueError(f"Source path is not a file: {source_path}")

            if source.suffix not in self.allowed_extensions:
                raise ValueError(f"Source file type not allowed: {source_path}")

            if destination.suffix not in self.allowed_extensions:
                raise ValueError(
                    f"Destination file type not allowed: {destination_path}"
                )

            # Create parent directories if they don't exist
            destination.parent.mkdir(parents=True, exist_ok=True)

            await asyncio.to_thread(shutil.copy2, source, destination)
        except Exception as e:
            raise Exception(f"Error copying file: {str(e)}")

    async def move_file(self, source_path: str, destination_path: str) -> None:
        """Move a file from source to destination."""
        try:
            source = self.base_path / source_path
            destination = self.base_path / destination_path

            if not source.exists():
                raise FileNotFoundError(f"Source file not found: {source_path}")

            if not source.is_file():
                raise ValueError(f"Source path is not a file: {source_path}")

            if source.suffix not in self.allowed_extensions:
                raise ValueError(f"Source file type not allowed: {source_path}")

            if destination.suffix not in self.allowed_extensions:
                raise ValueError(
                    f"Destination file type not allowed: {destination_path}"
                )

            # Create parent directories if they don't exist
            destination.parent.mkdir(parents=True, exist_ok=True)

            await asyncio.to_thread(shutil.move, source, destination)
        except Exception as e:
            raise Exception(f"Error moving file: {str(e)}")

    async def search_files(
        self, query: str, path: str = "", case_sensitive: bool = False
    ) -> List[Dict[str, str]]:
        """Search for files containing the query string."""
        try:
            search_path = self.base_path / path
            if not search_path.exists():
                raise FileNotFoundError(f"Search path not found: {path}")

            results = []
            pattern = re.compile(query if case_sensitive else query.lower())

            async def search_file(file_path: Path) -> None:
                if file_path.suffix not in self.allowed_extensions:
                    return

                try:
                    async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                        content = await f.read()
                        if not case_sensitive:
                            content = content.lower()

                        if pattern.search(content):
                            results.append(
                                {
                                    "path": str(file_path.relative_to(self.base_path)),
                                    "name": file_path.name,
                                    "type": "file",
                                }
                            )
                except Exception:
                    # Skip files that can't be read
                    pass

            async def search_directory(dir_path: Path) -> None:
                for item in dir_path.iterdir():
                    if item.is_file():
                        await search_file(item)
                    elif item.is_dir():
                        await search_directory(item)

            await search_directory(search_path)
            return sorted(results, key=lambda x: x["path"])
        except Exception as e:
            raise Exception(f"Error searching files: {str(e)}")

    async def search_by_name(
        self, pattern: str, path: str = "", case_sensitive: bool = False
    ) -> List[Dict[str, str]]:
        """Search for files matching the name pattern."""
        try:
            search_path = self.base_path / path
            if not search_path.exists():
                raise FileNotFoundError(f"Search path not found: {path}")

            results = []
            regex = re.compile(pattern if case_sensitive else pattern.lower())

            async def search_directory(dir_path: Path) -> None:
                for item in dir_path.iterdir():
                    if item.is_file():
                        name = item.name if case_sensitive else item.name.lower()
                        if (
                            regex.search(name)
                            and item.suffix in self.allowed_extensions
                        ):
                            results.append(
                                {
                                    "path": str(item.relative_to(self.base_path)),
                                    "name": item.name,
                                    "type": "file",
                                }
                            )
                    elif item.is_dir():
                        await search_directory(item)

            await search_directory(search_path)
            return sorted(results, key=lambda x: x["path"])
        except Exception as e:
            raise Exception(f"Error searching files by name: {str(e)}")
