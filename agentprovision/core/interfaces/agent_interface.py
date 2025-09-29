"""
Standardized Agent Interface for agentprovision.

This module defines the contract that all agents must implement to ensure
consistent behavior, monitoring, and management across the platform.
"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class AgentState(str, Enum):
    """Agent lifecycle states."""

    CREATED = "created"
    INITIALIZING = "initializing"
    READY = "ready"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"
    TERMINATED = "terminated"


class TaskStatus(str, Enum):
    """Task execution status."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class HealthStatus(str, Enum):
    """Agent health status."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class AgentConfig(BaseModel):
    """Agent configuration model."""

    id: str
    name: str
    agent_type: str
    version: str = "1.0.0"
    description: Optional[str] = None

    # Resource requirements
    cpu_cores: float = 1.0
    memory_mb: int = 512
    storage_mb: int = 1024
    max_concurrent_tasks: int = 5

    # Execution settings
    timeout_seconds: int = 300
    retry_attempts: int = 3
    heartbeat_interval: int = 30

    # LLM settings
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
    llm_temperature: float = 0.7
    llm_max_tokens: Optional[int] = None

    # Integration settings
    integrations: Dict[str, Dict[str, Any]] = Field(default_factory=dict)

    # Security settings
    security_level: str = "standard"  # minimal, standard, high, maximum
    # public, internal, confidential, restricted
    data_classification: str = "internal"

    # Custom parameters
    parameters: Dict[str, Any] = Field(default_factory=dict)

    # Tenant context
    tenant_id: int
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Task(BaseModel):
    """Task model for agent execution."""

    id: UUID = Field(default_factory=uuid4)
    agent_id: str
    tenant_id: int
    task_type: str
    priority: str = "normal"  # low, normal, high, critical

    # Task data
    input_data: Dict[str, Any]
    context: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    # Execution settings
    timeout_seconds: Optional[int] = None
    retry_attempts: Optional[int] = None
    dependencies: List[UUID] = Field(default_factory=list)

    # Status tracking
    status: TaskStatus = TaskStatus.PENDING
    progress: float = 0.0
    error_message: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Results
    output_data: Optional[Dict[str, Any]] = None
    artifacts: List[str] = Field(default_factory=list)  # File paths or URLs


class TaskResult(BaseModel):
    """Task execution result."""

    task_id: UUID
    status: TaskStatus
    output_data: Optional[Dict[str, Any]] = None
    artifacts: List[str] = Field(default_factory=list)
    error_message: Optional[str] = None
    execution_time_ms: float = 0.0
    resource_usage: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentMetrics(BaseModel):
    """Agent performance metrics."""

    agent_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Performance metrics
    cpu_usage_percent: float = 0.0
    memory_usage_mb: float = 0.0
    storage_usage_mb: float = 0.0
    network_io_mb: float = 0.0

    # Task metrics
    tasks_completed: int = 0
    tasks_failed: int = 0
    avg_execution_time_ms: float = 0.0
    success_rate: float = 100.0

    # Health metrics
    health_status: HealthStatus = HealthStatus.HEALTHY
    last_heartbeat: datetime = Field(default_factory=datetime.utcnow)
    uptime_seconds: float = 0.0

    # Custom metrics
    custom_metrics: Dict[str, float] = Field(default_factory=dict)


class ResourceUsage(BaseModel):
    """Current resource usage."""

    cpu_cores_used: float = 0.0
    memory_mb_used: float = 0.0
    storage_mb_used: float = 0.0
    network_io_mb_per_sec: float = 0.0
    active_tasks: int = 0
    queue_length: int = 0


class ValidationResult(BaseModel):
    """Configuration validation result."""

    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)


class AgentInterface(ABC):
    """
    Abstract base class defining the standard interface for all agents.

    All agents must implement this interface to ensure consistent behavior,
    monitoring, and management across the platform.
    """

    def __init__(self, config: AgentConfig):
        self.config = config
        self.state = AgentState.CREATED
        self.metrics = AgentMetrics(agent_id=config.id)
        self.current_tasks: Dict[UUID, Task] = {}
        self.task_history: List[TaskResult] = []
        self._shutdown_event = asyncio.Event()

    # Lifecycle Methods

    @abstractmethod
    async def initialize(self) -> bool:
        """
        Initialize the agent with its configuration.

        Returns:
            bool: True if initialization successful, False otherwise
        """
        pass

    @abstractmethod
    async def start(self) -> bool:
        """
        Start the agent and begin accepting tasks.

        Returns:
            bool: True if start successful, False otherwise
        """
        pass

    @abstractmethod
    async def stop(self) -> bool:
        """
        Stop the agent gracefully, completing current tasks.

        Returns:
            bool: True if stop successful, False otherwise
        """
        pass

    @abstractmethod
    async def restart(self) -> bool:
        """
        Restart the agent (stop then start).

        Returns:
            bool: True if restart successful, False otherwise
        """
        pass

    async def terminate(self) -> bool:
        """
        Terminate the agent immediately, cancelling all tasks.

        Returns:
            bool: True if termination successful, False otherwise
        """
        self.state = AgentState.TERMINATED
        self._shutdown_event.set()

        # Cancel all running tasks
        for task in self.current_tasks.values():
            task.status = TaskStatus.CANCELLED

        return True

    # Execution Methods

    @abstractmethod
    async def execute(self, task: Task) -> TaskResult:
        """
        Execute a single task.

        Args:
            task: The task to execute

        Returns:
            TaskResult: The execution result
        """
        pass

    async def execute_batch(self, tasks: List[Task]) -> List[TaskResult]:
        """
        Execute multiple tasks in batch.

        Args:
            tasks: List of tasks to execute

        Returns:
            List[TaskResult]: List of execution results
        """
        results = []
        for task in tasks:
            try:
                result = await self.execute(task)
                results.append(result)
            except Exception as e:
                error_result = TaskResult(
                    task_id=task.id, status=TaskStatus.FAILED, error_message=str(e)
                )
                results.append(error_result)

        return results

    # Status and Monitoring Methods

    def get_state(self) -> AgentState:
        """Get current agent state."""
        return self.state

    async def get_metrics(self) -> AgentMetrics:
        """
        Get current agent metrics.

        Returns:
            AgentMetrics: Current performance metrics
        """
        # Update basic metrics
        self.metrics.active_tasks = len(self.current_tasks)
        self.metrics.timestamp = datetime.utcnow()

        return self.metrics

    async def get_resource_usage(self) -> ResourceUsage:
        """
        Get current resource usage.

        Returns:
            ResourceUsage: Current resource consumption
        """
        return ResourceUsage(
            active_tasks=len(self.current_tasks),
            queue_length=0,  # Override in subclasses if queuing is implemented
        )

    async def health_check(self) -> HealthStatus:
        """
        Perform health check.

        Returns:
            HealthStatus: Current health status
        """
        if self.state in [AgentState.ERROR, AgentState.TERMINATED]:
            return HealthStatus.UNHEALTHY
        elif self.state in [AgentState.READY, AgentState.RUNNING]:
            return HealthStatus.HEALTHY
        else:
            return HealthStatus.DEGRADED

    # Configuration Methods

    async def update_config(self, config: AgentConfig) -> bool:
        """
        Update agent configuration.

        Args:
            config: New configuration

        Returns:
            bool: True if update successful, False otherwise
        """
        validation_result = await self.validate_config(config)
        if not validation_result.is_valid:
            return False

        self.config = config
        self.config.updated_at = datetime.utcnow()
        return True

    async def validate_config(self, config: AgentConfig) -> ValidationResult:
        """
        Validate agent configuration.

        Args:
            config: Configuration to validate

        Returns:
            ValidationResult: Validation result with errors/warnings
        """
        errors = []
        warnings = []
        suggestions = []

        # Basic validation
        if not config.name:
            errors.append("Agent name is required")

        if not config.agent_type:
            errors.append("Agent type is required")

        if config.cpu_cores <= 0:
            errors.append("CPU cores must be positive")

        if config.memory_mb <= 0:
            errors.append("Memory must be positive")

        if config.max_concurrent_tasks <= 0:
            errors.append("Max concurrent tasks must be positive")

        # Performance suggestions
        if config.cpu_cores > 4:
            suggestions.append("Consider if more than 4 CPU cores are necessary")

        if config.memory_mb > 2048:
            suggestions.append("Consider if more than 2GB memory is necessary")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
        )

    # Task Management Methods

    async def can_accept_task(self, task: Task) -> bool:
        """
        Check if agent can accept a new task.

        Args:
            task: Task to check

        Returns:
            bool: True if task can be accepted
        """
        if self.state not in [AgentState.READY, AgentState.RUNNING]:
            return False

        if len(self.current_tasks) >= self.config.max_concurrent_tasks:
            return False

        return True

    async def get_task_status(self, task_id: UUID) -> Optional[TaskStatus]:
        """
        Get status of a specific task.

        Args:
            task_id: ID of the task

        Returns:
            Optional[TaskStatus]: Task status if found
        """
        task = self.current_tasks.get(task_id)
        return task.status if task else None

    async def cancel_task(self, task_id: UUID) -> bool:
        """
        Cancel a running task.

        Args:
            task_id: ID of the task to cancel

        Returns:
            bool: True if cancellation successful
        """
        task = self.current_tasks.get(task_id)
        if task:
            task.status = TaskStatus.CANCELLED
            return True
        return False

    # Utility Methods

    async def get_capabilities(self) -> List[str]:
        """
        Get list of agent capabilities.

        Returns:
            List[str]: List of capability names
        """
        return [self.config.agent_type]

    async def get_supported_task_types(self) -> List[str]:
        """
        Get list of supported task types.

        Returns:
            List[str]: List of task type names
        """
        return ["generic"]  # Override in subclasses

    def __str__(self) -> str:
        """String representation of the agent."""
        return f"{self.config.agent_type}Agent({self.config.name})"

    def __repr__(self) -> str:
        """Detailed string representation of the agent."""
        return (
            f"{self.__class__.__name__}("
            f"id='{self.config.id}', "
            f"name='{self.config.name}', "
            f"type='{self.config.agent_type}', "
            f"state='{self.state}', "
            f"tasks={len(self.current_tasks)})"
        )


class BaseAgent(AgentInterface):
    """
    Base implementation of AgentInterface with common functionality.

    Agents can inherit from this class to get default implementations
    and only override methods they need to customize.
    """

    async def initialize(self) -> bool:
        """Default initialization implementation."""
        try:
            self.state = AgentState.INITIALIZING

            # Validate configuration
            validation_result = await self.validate_config(self.config)
            if not validation_result.is_valid:
                self.state = AgentState.ERROR
                return False

            # Initialize metrics
            self.metrics = AgentMetrics(agent_id=self.config.id)

            self.state = AgentState.READY
            return True

        except Exception as e:
            self.state = AgentState.ERROR
            return False

    async def start(self) -> bool:
        """Default start implementation."""
        if self.state != AgentState.READY:
            return False

        self.state = AgentState.RUNNING

        # Start heartbeat task
        asyncio.create_task(self._heartbeat_loop())

        return True

    async def stop(self) -> bool:
        """Default stop implementation."""
        if self.state != AgentState.RUNNING:
            return False

        self.state = AgentState.STOPPING

        # Wait for current tasks to complete
        while self.current_tasks:
            await asyncio.sleep(0.1)

        self.state = AgentState.STOPPED
        return True

    async def restart(self) -> bool:
        """Default restart implementation."""
        if not await self.stop():
            return False

        if not await self.start():
            return False

        return True

    async def execute(self, task: Task) -> TaskResult:
        """Default execute implementation - override in subclasses."""
        start_time = datetime.utcnow()

        try:
            # Add task to current tasks
            self.current_tasks[task.id] = task
            task.status = TaskStatus.RUNNING
            task.started_at = start_time

            # Simulate work (override this in subclasses)
            await asyncio.sleep(1)

            # Complete task
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            task.output_data = {"message": "Task completed successfully"}

            # Create result
            execution_time = (task.completed_at - start_time).total_seconds() * 1000
            result = TaskResult(
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

            return result

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

            # Add to history
            if len(self.task_history) >= 1000:  # Keep last 1000 tasks
                self.task_history.pop(0)

            result = TaskResult(
                task_id=task.id,
                status=task.status,
                output_data=task.output_data,
                error_message=task.error_message,
            )
            self.task_history.append(result)

    async def _heartbeat_loop(self):
        """Internal heartbeat loop."""
        while self.state == AgentState.RUNNING:
            try:
                self.metrics.last_heartbeat = datetime.utcnow()
                await asyncio.sleep(self.config.heartbeat_interval)
            except Exception:
                break
