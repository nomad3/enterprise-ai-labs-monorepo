"""
Agent Runtime Service for agentprovision.

This service provides the execution environment for AI agents, handling:
- Agent lifecycle management
- Resource allocation and monitoring
- Task execution and scheduling
- Security and isolation
- Performance optimization
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Type
from uuid import UUID, uuid4

import psutil
from pydantic import BaseModel, Field

from agentprovision.core.config import get_settings
from agentprovision.core.interfaces.agent_interface import (AgentConfig,
                                                            AgentInterface,
                                                            AgentMetrics,
                                                            AgentState,
                                                            BaseAgent,
                                                            HealthStatus,
                                                            ResourceUsage,
                                                            Task, TaskResult,
                                                            TaskStatus)
from agentprovision.core.services.llm_engine import (LLMEngine, LLMRequest,
                                                     get_llm_engine)
from agentprovision.core.tools.tool_framework import (AgentSkill, BaseTool,
                                                      ToolResult,
                                                      get_skill_registry,
                                                      get_tool_registry)

logger = logging.getLogger(__name__)
settings = get_settings()


class RuntimeConfig(BaseModel):
    """Runtime configuration."""

    max_agents: int = 100
    max_cpu_cores: float = 8.0
    max_memory_mb: int = 8192
    max_storage_mb: int = 10240
    resource_check_interval: int = 30
    cleanup_interval: int = 300
    task_timeout_seconds: int = 3600
    enable_resource_limits: bool = True
    enable_security_sandbox: bool = True


class AgentInstance(BaseModel):
    """Runtime agent instance."""

    id: str
    config: AgentConfig
    agent: Optional[AgentInterface] = None
    state: AgentState = AgentState.CREATED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    last_heartbeat: datetime = Field(default_factory=datetime.utcnow)
    resource_usage: ResourceUsage = Field(default_factory=ResourceUsage)
    metrics: AgentMetrics = Field(default_factory=lambda: AgentMetrics(agent_id=""))
    error_message: Optional[str] = None
    restart_count: int = 0

    class Config:
        arbitrary_types_allowed = True


class FullStackAgent(BaseAgent):
    """Full-stack development agent implementation."""

    def __init__(self, config: AgentConfig, llm_engine: LLMEngine):
        super().__init__(config)
        self.llm_engine = llm_engine
        self.tool_registry = get_tool_registry()
        self.skill_registry = get_skill_registry()
        self.skills = self._initialize_skills()
        self.available_tools = self._initialize_tools()

    def _initialize_skills(self) -> List[AgentSkill]:
        """Initialize skills for this agent."""
        all_skills = self.skill_registry.list_skills()
        relevant_skills = [
            "file_management",
            "code_development",
            "web_research",
            "data_analysis",
        ]

        return [skill for skill in all_skills if skill.name in relevant_skills]

    def _initialize_tools(self) -> List[BaseTool]:
        """Initialize tools for this agent."""
        tools = []
        for skill in self.skills:
            for tool_name in skill.tools:
                tool = self.tool_registry.get_tool(tool_name)
                if tool and tool not in tools:
                    tools.append(tool)
        return tools

    async def use_tool(self, tool_name: str, parameters: Dict[str, Any]) -> ToolResult:
        """Use a specific tool."""
        tool = self.tool_registry.get_tool(tool_name)
        if not tool:
            return ToolResult(
                tool_name=tool_name,
                success=False,
                error_message=f"Tool {tool_name} not available",
            )

        # Check if agent has permission to use this tool
        if not self._can_use_tool(tool):
            return ToolResult(
                tool_name=tool_name,
                success=False,
                error_message=f"Agent does not have permission to use {tool_name}",
            )

        return await tool.execute(parameters, {"agent_id": self.config.id})

    def _can_use_tool(self, tool: BaseTool) -> bool:
        """Check if agent can use a specific tool."""
        # Check if any of the agent's skills use this tool
        for skill in self.skills:
            if tool.definition.name in skill.tools:
                return True
        return False

    async def get_supported_task_types(self) -> List[str]:
        """Get supported task types for full-stack agent."""
        return [
            "code_generation",
            "code_review",
            "bug_fix",
            "feature_implementation",
            "architecture_design",
            "documentation",
            "testing",
            "refactoring",
        ]

    async def execute(self, task: Task) -> TaskResult:
        """Execute a full-stack development task."""
        start_time = datetime.utcnow()

        try:
            # Add task to current tasks
            self.current_tasks[task.id] = task
            task.status = TaskStatus.RUNNING
            task.started_at = start_time

            # Process task based on type
            if task.task_type == "code_generation":
                result = await self._generate_code(task)
            elif task.task_type == "code_review":
                result = await self._review_code(task)
            elif task.task_type == "bug_fix":
                result = await self._fix_bug(task)
            elif task.task_type == "feature_implementation":
                result = await self._implement_feature(task)
            elif task.task_type == "architecture_design":
                result = await self._design_architecture(task)
            elif task.task_type == "documentation":
                result = await self._generate_documentation(task)
            elif task.task_type == "testing":
                result = await self._generate_tests(task)
            elif task.task_type == "refactoring":
                result = await self._refactor_code(task)
            else:
                raise ValueError(f"Unsupported task type: {task.task_type}")

            # Complete task
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            task.output_data = result

            # Create result
            execution_time = (task.completed_at - start_time).total_seconds() * 1000
            task_result = TaskResult(
                task_id=task.id,
                status=task.status,
                output_data=task.output_data,
                execution_time_ms=execution_time,
            )

            # Update metrics
            self.metrics.tasks_completed += 1
            self.metrics.avg_execution_time_ms = (
                self.metrics.avg_execution_time_ms * (self.metrics.tasks_completed - 1)
                + execution_time
            ) / self.metrics.tasks_completed

            return task_result

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()

            self.metrics.tasks_failed += 1

            return TaskResult(
                task_id=task.id, status=TaskStatus.FAILED, error_message=str(e)
            )

        finally:
            # Remove from current tasks
            self.current_tasks.pop(task.id, None)

    async def _generate_code(self, task: Task) -> Dict[str, Any]:
        """Generate code using LLM."""
        prompt = task.input_data.get("prompt", "")
        language = task.input_data.get("language", "python")
        requirements = task.input_data.get("requirements", "")

        system_prompt = f"""You are an expert {language} developer. Generate clean, efficient, and well-documented code.

Requirements: {requirements}

Follow best practices:
- Write clear, readable code
- Include proper error handling
- Add comprehensive comments
- Follow language conventions
- Include type hints where applicable
"""

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=2000,
            required_capabilities=["code_generation"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "code": response.content,
            "language": language,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "requirements": requirements,
                "generated_at": datetime.utcnow().isoformat(),
            },
        }

    async def _review_code(self, task: Task) -> Dict[str, Any]:
        """Review code using LLM."""
        code = task.input_data.get("code", "")
        language = task.input_data.get("language", "python")
        focus_areas = task.input_data.get(
            "focus_areas", ["security", "performance", "maintainability"]
        )

        system_prompt = f"""You are an expert code reviewer. Review the following {language} code and provide detailed feedback.

Focus on: {', '.join(focus_areas)}

Provide:
1. Overall assessment
2. Specific issues found
3. Suggestions for improvement
4. Security concerns
5. Performance optimizations
6. Code quality score (1-10)
"""

        prompt = f"Please review this {language} code:\n\n```{language}\n{code}\n```"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=1500,
            required_capabilities=["analysis"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "review": response.content,
            "language": language,
            "focus_areas": focus_areas,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "code_length": len(code),
                "reviewed_at": datetime.utcnow().isoformat(),
            },
        }

    async def _fix_bug(self, task: Task) -> Dict[str, Any]:
        """Fix bug in code using LLM."""
        code = task.input_data.get("code", "")
        bug_description = task.input_data.get("bug_description", "")
        error_message = task.input_data.get("error_message", "")
        language = task.input_data.get("language", "python")

        system_prompt = f"""You are an expert {language} developer specializing in debugging and bug fixes.

Analyze the code, identify the bug, and provide a fixed version.

Bug Description: {bug_description}
Error Message: {error_message}

Provide:
1. Root cause analysis
2. Fixed code
3. Explanation of the fix
4. Prevention strategies
"""

        prompt = f"Fix the bug in this {language} code:\n\n```{language}\n{code}\n```"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.1,
            max_tokens=2000,
            required_capabilities=["code_generation", "reasoning"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "fix": response.content,
            "language": language,
            "bug_description": bug_description,
            "error_message": error_message,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "original_code_length": len(code),
                "fixed_at": datetime.utcnow().isoformat(),
            },
        }

    async def _implement_feature(self, task: Task) -> Dict[str, Any]:
        """Implement a new feature using LLM."""
        feature_description = task.input_data.get("feature_description", "")
        existing_code = task.input_data.get("existing_code", "")
        language = task.input_data.get("language", "python")
        architecture = task.input_data.get("architecture", "")

        system_prompt = f"""You are an expert {language} developer implementing new features.

Feature Description: {feature_description}
Architecture: {architecture}

Provide:
1. Implementation plan
2. Complete code implementation
3. Integration instructions
4. Testing recommendations
5. Documentation

Follow best practices and maintain consistency with existing code.
"""

        prompt = f"Implement this feature in {language}:\n\nFeature: {feature_description}\n\nExisting code context:\n```{language}\n{existing_code}\n```"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=3000,
            required_capabilities=["code_generation", "reasoning"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "implementation": response.content,
            "feature_description": feature_description,
            "language": language,
            "architecture": architecture,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "existing_code_length": len(existing_code),
                "implemented_at": datetime.utcnow().isoformat(),
            },
        }

    async def _design_architecture(self, task: Task) -> Dict[str, Any]:
        """Design software architecture using LLM."""
        requirements = task.input_data.get("requirements", "")
        constraints = task.input_data.get("constraints", "")
        scale = task.input_data.get("scale", "medium")
        technology_stack = task.input_data.get("technology_stack", "")

        system_prompt = f"""You are a senior software architect designing scalable systems.

Requirements: {requirements}
Constraints: {constraints}
Scale: {scale}
Technology Stack: {technology_stack}

Provide:
1. High-level architecture diagram (text description)
2. Component breakdown
3. Data flow design
4. Technology recommendations
5. Scalability considerations
6. Security considerations
7. Deployment strategy
"""

        prompt = f"Design a software architecture for: {requirements}"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.4,
            max_tokens=2500,
            required_capabilities=["reasoning", "analysis"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "architecture": response.content,
            "requirements": requirements,
            "constraints": constraints,
            "scale": scale,
            "technology_stack": technology_stack,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {"designed_at": datetime.utcnow().isoformat()},
        }

    async def _generate_documentation(self, task: Task) -> Dict[str, Any]:
        """Generate documentation using LLM."""
        code = task.input_data.get("code", "")
        doc_type = task.input_data.get("doc_type", "api")  # api, user, technical
        language = task.input_data.get("language", "python")

        system_prompt = f"""You are a technical writer creating {doc_type} documentation.

Generate comprehensive {doc_type} documentation for the provided {language} code.

Include:
1. Overview and purpose
2. Installation/setup instructions
3. Usage examples
4. API reference (if applicable)
5. Configuration options
6. Troubleshooting guide
7. Best practices

Write clear, concise, and user-friendly documentation.
"""

        prompt = f"Generate {doc_type} documentation for this {language} code:\n\n```{language}\n{code}\n```"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=2000,
            required_capabilities=["text_generation"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "documentation": response.content,
            "doc_type": doc_type,
            "language": language,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "code_length": len(code),
                "generated_at": datetime.utcnow().isoformat(),
            },
        }

    async def _generate_tests(self, task: Task) -> Dict[str, Any]:
        """Generate tests using LLM."""
        code = task.input_data.get("code", "")
        test_type = task.input_data.get("test_type", "unit")  # unit, integration, e2e
        language = task.input_data.get("language", "python")
        framework = task.input_data.get("framework", "pytest")

        system_prompt = f"""You are a test automation expert writing {test_type} tests in {language} using {framework}.

Generate comprehensive {test_type} tests for the provided code.

Include:
1. Test setup and teardown
2. Positive test cases
3. Negative test cases
4. Edge cases
5. Mock/stub usage where appropriate
6. Assertions and validations
7. Test data management

Follow {framework} best practices and conventions.
"""

        prompt = f"Generate {test_type} tests for this {language} code using {framework}:\n\n```{language}\n{code}\n```"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=2500,
            required_capabilities=["code_generation"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "tests": response.content,
            "test_type": test_type,
            "language": language,
            "framework": framework,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "code_length": len(code),
                "generated_at": datetime.utcnow().isoformat(),
            },
        }

    async def _refactor_code(self, task: Task) -> Dict[str, Any]:
        """Refactor code using LLM."""
        code = task.input_data.get("code", "")
        refactor_goals = task.input_data.get(
            "refactor_goals", ["improve_readability", "optimize_performance"]
        )
        language = task.input_data.get("language", "python")

        system_prompt = f"""You are an expert {language} developer specializing in code refactoring.

Refactor the provided code to achieve these goals: {', '.join(refactor_goals)}

Provide:
1. Refactored code
2. Explanation of changes made
3. Benefits of the refactoring
4. Performance impact analysis
5. Migration guide (if breaking changes)

Maintain functionality while improving code quality.
"""

        prompt = f"Refactor this {language} code:\n\n```{language}\n{code}\n```"

        llm_request = LLMRequest(
            tenant_id=self.config.tenant_id,
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=2500,
            required_capabilities=["code_generation", "analysis"],
        )

        response = await self.llm_engine.generate(llm_request)

        return {
            "refactored_code": response.content,
            "refactor_goals": refactor_goals,
            "language": language,
            "model_used": response.model_used,
            "cost": response.cost,
            "metadata": {
                "original_code_length": len(code),
                "refactored_at": datetime.utcnow().isoformat(),
            },
        }


class DevOpsAgent(BaseAgent):
    """DevOps agent implementation."""

    def __init__(self, config: AgentConfig, llm_engine: LLMEngine):
        super().__init__(config)
        self.llm_engine = llm_engine

    async def get_supported_task_types(self) -> List[str]:
        """Get supported task types for DevOps agent."""
        return [
            "infrastructure_provisioning",
            "deployment_automation",
            "monitoring_setup",
            "security_configuration",
            "performance_optimization",
            "disaster_recovery",
            "ci_cd_pipeline",
            "container_orchestration",
        ]


class AgentRuntime:
    """
    Agent Runtime Service for managing agent execution environments.
    """

    def __init__(self, config: RuntimeConfig = None):
        self.config = config or RuntimeConfig()
        self.agents: Dict[str, AgentInstance] = {}
        self.agent_classes: Dict[str, Type[AgentInterface]] = {
            "full_stack": FullStackAgent,
            "devops": DevOpsAgent,
            # Add more agent types as needed
        }
        self.llm_engine: Optional[LLMEngine] = None
        self._runtime_running = False
        self._resource_monitor_task: Optional[asyncio.Task] = None
        self._cleanup_task: Optional[asyncio.Task] = None

    async def start_runtime(self):
        """Start the agent runtime service."""
        self._runtime_running = True
        logger.info("Agent Runtime started")

        # Initialize LLM engine
        self.llm_engine = await get_llm_engine()

        # Start background tasks
        self._resource_monitor_task = asyncio.create_task(self._monitor_resources())
        self._cleanup_task = asyncio.create_task(self._cleanup_agents())

    async def stop_runtime(self):
        """Stop the agent runtime service."""
        self._runtime_running = False

        # Stop all agents
        for agent_id in list(self.agents.keys()):
            await self.stop_agent(agent_id)

        # Cancel background tasks
        if self._resource_monitor_task:
            self._resource_monitor_task.cancel()
        if self._cleanup_task:
            self._cleanup_task.cancel()

        logger.info("Agent Runtime stopped")

    async def create_agent(self, config: AgentConfig) -> str:
        """Create a new agent instance."""
        if len(self.agents) >= self.config.max_agents:
            raise Exception(
                f"Maximum number of agents ({self.config.max_agents}) reached"
            )

        # Check resource availability
        if not await self._check_resource_availability(config):
            raise Exception("Insufficient resources to create agent")

        # Get agent class
        agent_class = self.agent_classes.get(config.agent_type)
        if not agent_class:
            raise Exception(f"Unsupported agent type: {config.agent_type}")

        # Create agent instance
        if config.agent_type in ["full_stack", "devops"]:
            agent = agent_class(config, self.llm_engine)
        else:
            agent = agent_class(config)

        # Initialize agent
        if not await agent.initialize():
            raise Exception("Failed to initialize agent")

        # Create runtime instance
        instance = AgentInstance(
            id=config.id,
            config=config,
            agent=agent,
            state=agent.get_state(),
            metrics=await agent.get_metrics(),
        )

        self.agents[config.id] = instance
        logger.info(f"Created agent {config.id} of type {config.agent_type}")

        return config.id

    async def start_agent(self, agent_id: str) -> bool:
        """Start an agent."""
        instance = self.agents.get(agent_id)
        if not instance or not instance.agent:
            return False

        if await instance.agent.start():
            instance.state = instance.agent.get_state()
            instance.started_at = datetime.utcnow()
            logger.info(f"Started agent {agent_id}")
            return True

        return False

    async def stop_agent(self, agent_id: str) -> bool:
        """Stop an agent."""
        instance = self.agents.get(agent_id)
        if not instance or not instance.agent:
            return False

        if await instance.agent.stop():
            instance.state = instance.agent.get_state()
            logger.info(f"Stopped agent {agent_id}")
            return True

        return False

    async def restart_agent(self, agent_id: str) -> bool:
        """Restart an agent."""
        instance = self.agents.get(agent_id)
        if not instance or not instance.agent:
            return False

        if await instance.agent.restart():
            instance.state = instance.agent.get_state()
            instance.restart_count += 1
            logger.info(f"Restarted agent {agent_id}")
            return True

        return False

    async def terminate_agent(self, agent_id: str) -> bool:
        """Terminate and remove an agent."""
        instance = self.agents.get(agent_id)
        if not instance or not instance.agent:
            return False

        await instance.agent.terminate()
        del self.agents[agent_id]
        logger.info(f"Terminated agent {agent_id}")
        return True

    async def execute_task(self, agent_id: str, task: Task) -> TaskResult:
        """Execute a task on an agent."""
        instance = self.agents.get(agent_id)
        if not instance or not instance.agent:
            raise Exception(f"Agent {agent_id} not found")

        if not await instance.agent.can_accept_task(task):
            raise Exception(f"Agent {agent_id} cannot accept task")

        # Set task timeout
        task.timeout_seconds = task.timeout_seconds or self.config.task_timeout_seconds

        try:
            # Execute task with timeout
            result = await asyncio.wait_for(
                instance.agent.execute(task), timeout=task.timeout_seconds
            )

            # Update instance metrics
            instance.metrics = await instance.agent.get_metrics()
            instance.last_heartbeat = datetime.utcnow()

            return result

        except asyncio.TimeoutError:
            # Cancel task and return timeout result
            await instance.agent.cancel_task(task.id)
            return TaskResult(
                task_id=task.id,
                status=TaskStatus.TIMEOUT,
                error_message=f"Task timed out after {task.timeout_seconds} seconds",
            )

    async def get_agent_status(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent status and metrics."""
        instance = self.agents.get(agent_id)
        if not instance or not instance.agent:
            return None

        metrics = await instance.agent.get_metrics()
        resource_usage = await instance.agent.get_resource_usage()
        health_status = await instance.agent.health_check()

        return {
            "id": agent_id,
            "config": instance.config.dict(),
            "state": instance.state,
            "health_status": health_status,
            "metrics": metrics.dict(),
            "resource_usage": resource_usage.dict(),
            "created_at": instance.created_at,
            "started_at": instance.started_at,
            "last_heartbeat": instance.last_heartbeat,
            "restart_count": instance.restart_count,
            "error_message": instance.error_message,
        }

    async def list_agents(
        self, tenant_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """List all agents or agents for a specific tenant."""
        agents = []

        for instance in self.agents.values():
            if tenant_id is None or instance.config.tenant_id == tenant_id:
                status = await self.get_agent_status(instance.id)
                if status:
                    agents.append(status)

        return agents

    async def get_runtime_metrics(self) -> Dict[str, Any]:
        """Get runtime-wide metrics."""
        total_agents = len(self.agents)
        running_agents = sum(
            1 for i in self.agents.values() if i.state == AgentState.RUNNING
        )

        # System resource usage
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        # Agent type breakdown
        agent_types = {}
        for instance in self.agents.values():
            agent_type = instance.config.agent_type
            agent_types[agent_type] = agent_types.get(agent_type, 0) + 1

        return {
            "total_agents": total_agents,
            "running_agents": running_agents,
            "agent_types": agent_types,
            "system_resources": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_mb": memory.available // 1024 // 1024,
                "disk_percent": (disk.used / disk.total) * 100,
                "disk_free_mb": disk.free // 1024 // 1024,
            },
            "timestamp": datetime.utcnow(),
        }

    async def _check_resource_availability(self, config: AgentConfig) -> bool:
        """Check if resources are available for new agent."""
        if not self.config.enable_resource_limits:
            return True

        # Calculate current resource usage
        total_cpu = sum(i.config.cpu_cores for i in self.agents.values())
        total_memory = sum(i.config.memory_mb for i in self.agents.values())
        total_storage = sum(i.config.storage_mb for i in self.agents.values())

        # Check if new agent would exceed limits
        if (
            total_cpu + config.cpu_cores > self.config.max_cpu_cores
            or total_memory + config.memory_mb > self.config.max_memory_mb
            or total_storage + config.storage_mb > self.config.max_storage_mb
        ):
            return False

        return True

    async def _monitor_resources(self):
        """Background task to monitor resource usage."""
        while self._runtime_running:
            try:
                for instance in self.agents.values():
                    if instance.agent:
                        # Update resource usage
                        instance.resource_usage = (
                            await instance.agent.get_resource_usage()
                        )
                        instance.metrics = await instance.agent.get_metrics()

                        # Check health
                        health = await instance.agent.health_check()
                        if health == HealthStatus.UNHEALTHY:
                            logger.warning(f"Agent {instance.id} is unhealthy")
                            # Could trigger automatic restart here

                await asyncio.sleep(self.config.resource_check_interval)

            except Exception as e:
                logger.error(f"Error monitoring resources: {e}")
                await asyncio.sleep(60)

    async def _cleanup_agents(self):
        """Background task to cleanup terminated agents."""
        while self._runtime_running:
            try:
                agents_to_remove = []

                for agent_id, instance in self.agents.items():
                    if instance.state == AgentState.TERMINATED:
                        # Remove terminated agents after some time
                        if (
                            datetime.utcnow() - instance.last_heartbeat
                        ).total_seconds() > 300:
                            agents_to_remove.append(agent_id)

                for agent_id in agents_to_remove:
                    del self.agents[agent_id]
                    logger.info(f"Cleaned up terminated agent {agent_id}")

                await asyncio.sleep(self.config.cleanup_interval)

            except Exception as e:
                logger.error(f"Error cleaning up agents: {e}")
                await asyncio.sleep(300)


# Global runtime instance
agent_runtime = AgentRuntime()


async def get_agent_runtime() -> AgentRuntime:
    """Get the global agent runtime instance."""
    return agent_runtime
