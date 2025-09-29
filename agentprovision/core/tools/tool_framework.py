"""
Tool Framework for agentprovision agents.

This module provides a comprehensive framework for agent tools and skills,
enabling agents to execute various operations and interact with external systems.
"""

import asyncio
import json
import logging
import subprocess
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

import aiofiles
import aiohttp
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ToolCategory(str, Enum):
    """Categories of tools available to agents."""

    FILE_SYSTEM = "file_system"
    CODE_EXECUTION = "code_execution"
    WEB_BROWSING = "web_browsing"
    API_INTEGRATION = "api_integration"
    DATABASE = "database"
    COMMUNICATION = "communication"
    ANALYSIS = "analysis"
    DEVELOPMENT = "development"
    DEVOPS = "devops"
    SECURITY = "security"


class ToolPermission(str, Enum):
    """Permission levels for tool usage."""

    READ_ONLY = "read_only"
    WRITE = "write"
    EXECUTE = "execute"
    ADMIN = "admin"


class ToolResult(BaseModel):
    """Result of tool execution."""

    tool_name: str
    success: bool
    output: Any = None
    error_message: Optional[str] = None
    execution_time_ms: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ToolDefinition(BaseModel):
    """Definition of a tool that agents can use."""

    name: str
    description: str
    category: ToolCategory
    parameters: Dict[str, Any] = Field(default_factory=dict)
    required_permissions: List[ToolPermission] = Field(default_factory=list)
    examples: List[Dict[str, Any]] = Field(default_factory=list)
    is_async: bool = True
    timeout_seconds: int = 30
    requires_approval: bool = False


class AgentSkill(BaseModel):
    """Represents a skill that an agent possesses."""

    name: str
    description: str
    category: str
    proficiency_level: int = Field(ge=1, le=10)  # 1-10 scale
    # Tool names this skill uses
    tools: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)  # Required skills
    examples: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BaseTool(ABC):
    """Base class for all agent tools."""

    def __init__(self, definition: ToolDefinition):
        self.definition = definition
        self.usage_count = 0
        self.last_used = None

    @abstractmethod
    async def execute(
        self, parameters: Dict[str, Any], context: Dict[str, Any] = None
    ) -> ToolResult:
        """Execute the tool with given parameters."""
        pass

    def get_definition(self) -> ToolDefinition:
        """Get tool definition."""
        return self.definition

    async def validate_parameters(self, parameters: Dict[str, Any]) -> bool:
        """Validate tool parameters."""
        # Basic validation - override in subclasses for specific validation
        required_params = self.definition.parameters.get("required", [])
        return all(param in parameters for param in required_params)


class FileSystemTool(BaseTool):
    """Tool for file system operations."""

    def __init__(self):
        definition = ToolDefinition(
            name="file_system",
            description="Read, write, and manage files and directories",
            category=ToolCategory.FILE_SYSTEM,
            parameters={
                "required": ["operation"],
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["read", "write", "list", "create_dir", "delete"],
                    },
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                    "encoding": {"type": "string", "default": "utf-8"},
                },
            },
            required_permissions=[ToolPermission.READ_ONLY, ToolPermission.WRITE],
            examples=[
                {"operation": "read", "path": "/path/to/file.txt"},
                {
                    "operation": "write",
                    "path": "/path/to/file.txt",
                    "content": "Hello World",
                },
                {"operation": "list", "path": "/path/to/directory"},
            ],
        )
        super().__init__(definition)

    async def execute(
        self, parameters: Dict[str, Any], context: Dict[str, Any] = None
    ) -> ToolResult:
        """Execute file system operation."""
        start_time = datetime.utcnow()

        try:
            operation = parameters.get("operation")
            path = parameters.get("path")

            if operation == "read":
                async with aiofiles.open(
                    path, "r", encoding=parameters.get("encoding", "utf-8")
                ) as f:
                    content = await f.read()
                result = ToolResult(
                    tool_name=self.definition.name,
                    success=True,
                    output={"content": content, "size": len(content)},
                    execution_time_ms=(datetime.utcnow() - start_time).total_seconds()
                    * 1000,
                )

            elif operation == "write":
                content = parameters.get("content", "")
                async with aiofiles.open(
                    path, "w", encoding=parameters.get("encoding", "utf-8")
                ) as f:
                    await f.write(content)
                result = ToolResult(
                    tool_name=self.definition.name,
                    success=True,
                    output={"bytes_written": len(content.encode())},
                    execution_time_ms=(datetime.utcnow() - start_time).total_seconds()
                    * 1000,
                )

            elif operation == "list":
                import os

                items = []
                for item in os.listdir(path):
                    item_path = os.path.join(path, item)
                    items.append(
                        {
                            "name": item,
                            "type": "directory" if os.path.isdir(item_path) else "file",
                            "size": (
                                os.path.getsize(item_path)
                                if os.path.isfile(item_path)
                                else None
                            ),
                        }
                    )
                result = ToolResult(
                    tool_name=self.definition.name,
                    success=True,
                    output={"items": items, "count": len(items)},
                    execution_time_ms=(datetime.utcnow() - start_time).total_seconds()
                    * 1000,
                )

            else:
                result = ToolResult(
                    tool_name=self.definition.name,
                    success=False,
                    error_message=f"Unsupported operation: {operation}",
                )

            self.usage_count += 1
            self.last_used = datetime.utcnow()
            return result

        except Exception as e:
            return ToolResult(
                tool_name=self.definition.name,
                success=False,
                error_message=str(e),
                execution_time_ms=(datetime.utcnow() - start_time).total_seconds()
                * 1000,
            )


class CodeExecutionTool(BaseTool):
    """Tool for executing code in various languages."""

    def __init__(self):
        definition = ToolDefinition(
            name="code_execution",
            description="Execute code in various programming languages",
            category=ToolCategory.CODE_EXECUTION,
            parameters={
                "required": ["language", "code"],
                "properties": {
                    "language": {
                        "type": "string",
                        "enum": ["python", "javascript", "bash", "sql"],
                    },
                    "code": {"type": "string"},
                    "timeout": {"type": "integer", "default": 30},
                    "working_directory": {"type": "string", "default": "/tmp"},
                },
            },
            required_permissions=[ToolPermission.EXECUTE],
            requires_approval=True,
            examples=[
                {"language": "python", "code": "print('Hello World')"},
                {"language": "bash", "code": "ls -la"},
                {"language": "javascript", "code": "console.log('Hello World')"},
            ],
        )
        super().__init__(definition)

    async def execute(
        self, parameters: Dict[str, Any], context: Dict[str, Any] = None
    ) -> ToolResult:
        """Execute code safely."""
        start_time = datetime.utcnow()

        try:
            language = parameters.get("language")
            code = parameters.get("code")
            timeout = parameters.get("timeout", 30)
            working_dir = parameters.get("working_directory", "/tmp")

            # Security check - basic code safety validation
            if not await self._is_code_safe(code, language):
                return ToolResult(
                    tool_name=self.definition.name,
                    success=False,
                    error_message="Code contains potentially unsafe operations",
                )

            # Execute based on language
            if language == "python":
                result = await self._execute_python(code, timeout, working_dir)
            elif language == "javascript":
                result = await self._execute_javascript(code, timeout, working_dir)
            elif language == "bash":
                result = await self._execute_bash(code, timeout, working_dir)
            else:
                return ToolResult(
                    tool_name=self.definition.name,
                    success=False,
                    error_message=f"Unsupported language: {language}",
                )

            self.usage_count += 1
            self.last_used = datetime.utcnow()
            return result

        except Exception as e:
            return ToolResult(
                tool_name=self.definition.name,
                success=False,
                error_message=str(e),
                execution_time_ms=(datetime.utcnow() - start_time).total_seconds()
                * 1000,
            )

    async def _is_code_safe(self, code: str, language: str) -> bool:
        """Basic safety check for code execution."""
        dangerous_patterns = [
            "rm -rf",
            "del /",
            "format",
            "mkfs",
            "sudo",
            "su -",
            "chmod 777",
            "eval(",
            "exec(",
            "import os",
            "subprocess",
            "system(",
            "__import__",
            "open(",
        ]

        code_lower = code.lower()
        return not any(pattern in code_lower for pattern in dangerous_patterns)

    async def _execute_python(
        self, code: str, timeout: int, working_dir: str
    ) -> ToolResult:
        """Execute Python code."""
        try:
            # Create a safe execution environment
            safe_code = f"""
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()

try:
    with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
        {code}

    print("EXECUTION_SUCCESS")
    print("STDOUT:", stdout_buffer.getvalue())
    print("STDERR:", stderr_buffer.getvalue())
except Exception as e:
    print("EXECUTION_ERROR:", str(e))
"""

            process = await asyncio.create_subprocess_exec(
                "python3",
                "-c",
                safe_code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=working_dir,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=timeout
            )

            output = stdout.decode() if stdout else ""
            error = stderr.decode() if stderr else ""

            return ToolResult(
                tool_name=self.definition.name,
                success="EXECUTION_SUCCESS" in output,
                output={
                    "stdout": output,
                    "stderr": error,
                    "return_code": process.returncode,
                },
                execution_time_ms=(
                    datetime.utcnow() - datetime.utcnow()
                ).total_seconds()
                * 1000,
            )

        except asyncio.TimeoutError:
            return ToolResult(
                tool_name=self.definition.name,
                success=False,
                error_message=f"Code execution timed out after {timeout} seconds",
            )

    async def _execute_javascript(
        self, code: str, timeout: int, working_dir: str
    ) -> ToolResult:
        """Execute JavaScript code using Node.js."""
        try:
            process = await asyncio.create_subprocess_exec(
                "node",
                "-e",
                code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=working_dir,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=timeout
            )

            return ToolResult(
                tool_name=self.definition.name,
                success=process.returncode == 0,
                output={
                    "stdout": stdout.decode(),
                    "stderr": stderr.decode(),
                    "return_code": process.returncode,
                },
            )

        except asyncio.TimeoutError:
            return ToolResult(
                tool_name=self.definition.name,
                success=False,
                error_message=f"Code execution timed out after {timeout} seconds",
            )

    async def _execute_bash(
        self, code: str, timeout: int, working_dir: str
    ) -> ToolResult:
        """Execute Bash code."""
        try:
            process = await asyncio.create_subprocess_shell(
                code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=working_dir,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=timeout
            )

            return ToolResult(
                tool_name=self.definition.name,
                success=process.returncode == 0,
                output={
                    "stdout": stdout.decode(),
                    "stderr": stderr.decode(),
                    "return_code": process.returncode,
                },
            )

        except asyncio.TimeoutError:
            return ToolResult(
                tool_name=self.definition.name,
                success=False,
                error_message=f"Code execution timed out after {timeout} seconds",
            )


class WebBrowsingTool(BaseTool):
    """Tool for web browsing and HTTP requests."""

    def __init__(self):
        definition = ToolDefinition(
            name="web_browsing",
            description="Browse websites and make HTTP requests",
            category=ToolCategory.WEB_BROWSING,
            parameters={
                "required": ["operation"],
                "properties": {
                    "operation": {"type": "string", "enum": ["get", "post", "search"]},
                    "url": {"type": "string"},
                    "headers": {"type": "object"},
                    "data": {"type": "object"},
                    "query": {"type": "string"},
                },
            },
            required_permissions=[ToolPermission.READ_ONLY],
            examples=[
                {"operation": "get", "url": "https://api.github.com/user"},
                {"operation": "search", "query": "Python programming tutorials"},
            ],
        )
        super().__init__(definition)

    async def execute(
        self, parameters: Dict[str, Any], context: Dict[str, Any] = None
    ) -> ToolResult:
        """Execute web browsing operation."""
        start_time = datetime.utcnow()

        try:
            operation = parameters.get("operation")

            if operation == "get":
                return await self._make_http_request("GET", parameters)
            elif operation == "post":
                return await self._make_http_request("POST", parameters)
            elif operation == "search":
                return await self._web_search(parameters.get("query"))
            else:
                return ToolResult(
                    tool_name=self.definition.name,
                    success=False,
                    error_message=f"Unsupported operation: {operation}",
                )

        except Exception as e:
            return ToolResult(
                tool_name=self.definition.name,
                success=False,
                error_message=str(e),
                execution_time_ms=(datetime.utcnow() - start_time).total_seconds()
                * 1000,
            )

    async def _make_http_request(
        self, method: str, parameters: Dict[str, Any]
    ) -> ToolResult:
        """Make HTTP request."""
        url = parameters.get("url")
        headers = parameters.get("headers", {})
        data = parameters.get("data")

        async with aiohttp.ClientSession() as session:
            async with session.request(
                method, url, headers=headers, json=data
            ) as response:
                content = await response.text()

                return ToolResult(
                    tool_name=self.definition.name,
                    success=response.status < 400,
                    output={
                        "status_code": response.status,
                        "headers": dict(response.headers),
                        "content": content[:1000],  # Limit content size
                        "content_length": len(content),
                    },
                )

    async def _web_search(self, query: str) -> ToolResult:
        """Perform web search (simplified implementation)."""
        # This would integrate with a search API like Google Custom Search
        return ToolResult(
            tool_name=self.definition.name,
            success=True,
            output={
                "query": query,
                "message": "Web search functionality requires API integration",
                "suggestion": "Use specific URLs with the 'get' operation instead",
            },
        )


class ToolRegistry:
    """Registry for managing available tools."""

    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        self._initialize_default_tools()

    def _initialize_default_tools(self):
        """Initialize default tools."""
        default_tools = [
            FileSystemTool(),
            CodeExecutionTool(),
            WebBrowsingTool(),
        ]

        for tool in default_tools:
            self.register_tool(tool)

    def register_tool(self, tool: BaseTool):
        """Register a new tool."""
        self.tools[tool.definition.name] = tool
        logger.info(f"Registered tool: {tool.definition.name}")

    def get_tool(self, name: str) -> Optional[BaseTool]:
        """Get a tool by name."""
        return self.tools.get(name)

    def list_tools(
        self, category: Optional[ToolCategory] = None
    ) -> List[ToolDefinition]:
        """List available tools."""
        tools = list(self.tools.values())

        if category:
            tools = [t for t in tools if t.definition.category == category]

        return [tool.definition for tool in tools]

    def get_tools_for_skill(self, skill_name: str) -> List[BaseTool]:
        """Get tools associated with a specific skill."""
        # This would be enhanced with a skill-tool mapping
        return list(self.tools.values())


class SkillRegistry:
    """Registry for managing agent skills."""

    def __init__(self):
        self.skills: Dict[str, AgentSkill] = {}
        self._initialize_default_skills()

    def _initialize_default_skills(self):
        """Initialize default skills."""
        default_skills = [
            AgentSkill(
                name="file_management",
                description="Read, write, and organize files and directories",
                category="system",
                proficiency_level=8,
                tools=["file_system"],
                examples=[
                    "Read configuration files",
                    "Create project directories",
                    "Organize code files",
                ],
            ),
            AgentSkill(
                name="code_development",
                description="Write, test, and debug code in multiple languages",
                category="development",
                proficiency_level=9,
                tools=["code_execution", "file_system"],
                examples=[
                    "Write Python scripts",
                    "Debug JavaScript applications",
                    "Create unit tests",
                ],
            ),
            AgentSkill(
                name="web_research",
                description="Search and gather information from the web",
                category="research",
                proficiency_level=7,
                tools=["web_browsing"],
                examples=[
                    "Research programming libraries",
                    "Find API documentation",
                    "Gather market information",
                ],
            ),
            AgentSkill(
                name="data_analysis",
                description="Analyze and process data using various tools",
                category="analysis",
                proficiency_level=8,
                tools=["code_execution", "file_system"],
                examples=[
                    "Process CSV files",
                    "Generate data visualizations",
                    "Statistical analysis",
                ],
            ),
            AgentSkill(
                name="system_administration",
                description="Manage and configure system resources",
                category="devops",
                proficiency_level=7,
                tools=["code_execution", "file_system"],
                prerequisites=["file_management"],
                examples=[
                    "Configure servers",
                    "Manage user permissions",
                    "Monitor system resources",
                ],
            ),
        ]

        for skill in default_skills:
            self.register_skill(skill)

    def register_skill(self, skill: AgentSkill):
        """Register a new skill."""
        self.skills[skill.name] = skill
        logger.info(f"Registered skill: {skill.name}")

    def get_skill(self, name: str) -> Optional[AgentSkill]:
        """Get a skill by name."""
        return self.skills.get(name)

    def list_skills(self, category: Optional[str] = None) -> List[AgentSkill]:
        """List available skills."""
        skills = list(self.skills.values())

        if category:
            skills = [s for s in skills if s.category == category]

        return skills

    def get_skills_for_tools(self, tool_names: List[str]) -> List[AgentSkill]:
        """Get skills that use specific tools."""
        return [
            skill
            for skill in self.skills.values()
            if any(tool in skill.tools for tool in tool_names)
        ]


# Global registries
tool_registry = ToolRegistry()
skill_registry = SkillRegistry()


def get_tool_registry() -> ToolRegistry:
    """Get the global tool registry."""
    return tool_registry


def get_skill_registry() -> SkillRegistry:
    """Get the global skill registry."""
    return skill_registry
