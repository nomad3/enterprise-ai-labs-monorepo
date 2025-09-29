"""
Agent Orchestration Service for agentprovision.

This service handles:
- Agent lifecycle management
- Task distribution and scheduling
- Resource optimization
- Performance monitoring
- Workflow automation
- Agent health monitoring
"""

import asyncio
import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from agentprovision.core.config import get_settings
from agentprovision.core.database import get_session
from agentprovision.core.models.agent_model import Agent, AgentStatus

logger = logging.getLogger(__name__)
settings = get_settings()


class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentTask(BaseModel):
    """Represents a task to be executed by an agent."""

    id: UUID = Field(default_factory=uuid4)
    tenant_id: int
    agent_type: str
    task_type: str
    priority: TaskPriority = TaskPriority.NORMAL
    payload: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent_id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    retry_count: int = 0
    max_retries: int = 3
    timeout_seconds: int = 300
    dependencies: List[UUID] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentCapacity(BaseModel):
    """Represents an agent's current capacity and resource usage."""

    agent_id: int
    max_concurrent_tasks: int = 5
    current_tasks: int = 0
    cpu_usage_percent: float = 0.0
    memory_usage_mb: float = 0.0
    last_health_check: datetime = Field(default_factory=datetime.utcnow)
    is_healthy: bool = True
    average_task_duration: float = 0.0  # seconds


class WorkflowDefinition(BaseModel):
    """Defines a workflow with multiple agent tasks."""

    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    tenant_id: int
    steps: List[Dict[str, Any]]
    triggers: List[Dict[str, Any]]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentOrchestrator:
    """
    Core orchestration service for managing agents and tasks.
    """

    def __init__(self):
        self.task_queue: Dict[TaskPriority, List[AgentTask]] = {
            TaskPriority.CRITICAL: [],
            TaskPriority.HIGH: [],
            TaskPriority.NORMAL: [],
            TaskPriority.LOW: [],
        }
        self.agent_capacities: Dict[int, AgentCapacity] = {}
        self.running_tasks: Dict[UUID, AgentTask] = {}
        self.workflows: Dict[UUID, WorkflowDefinition] = {}
        self._orchestrator_running = False

    async def start_orchestrator(self):
        """Start the orchestration service."""
        self._orchestrator_running = True
        logger.info("Agent Orchestrator started")

        # Start background tasks
        asyncio.create_task(self._task_scheduler())
        asyncio.create_task(self._health_monitor())
        asyncio.create_task(self._resource_optimizer())

    async def stop_orchestrator(self):
        """Stop the orchestration service."""
        self._orchestrator_running = False
        logger.info("Agent Orchestrator stopped")

    async def submit_task(self, task: AgentTask) -> UUID:
        """Submit a new task for execution."""
        logger.info(
            f"Submitting task {task.id} of type {task.task_type} for tenant {task.tenant_id}"
        )

        # Validate task
        if not await self._validate_task(task):
            raise ValueError(f"Invalid task: {task.id}")

        # Add to appropriate priority queue
        self.task_queue[task.priority].append(task)

        # Trigger immediate scheduling for high priority tasks
        if task.priority in [TaskPriority.CRITICAL, TaskPriority.HIGH]:
            asyncio.create_task(self._schedule_task(task))

        return task.id

    async def submit_workflow(self, workflow: WorkflowDefinition) -> UUID:
        """Submit a workflow for execution."""
        logger.info(
            f"Submitting workflow {workflow.name} for tenant {workflow.tenant_id}"
        )

        self.workflows[workflow.id] = workflow

        # Create tasks for workflow steps
        for step in workflow.steps:
            task = AgentTask(
                tenant_id=workflow.tenant_id,
                agent_type=step.get("agent_type"),
                task_type=step.get("task_type"),
                priority=TaskPriority(step.get("priority", "normal")),
                payload=step.get("payload", {}),
                dependencies=step.get("dependencies", []),
                metadata={
                    "workflow_id": str(workflow.id),
                    "step_name": step.get("name"),
                },
            )
            await self.submit_task(task)

        return workflow.id

    async def get_agent_status(self, agent_id: int) -> Dict[str, Any]:
        """Get detailed status of an agent."""
        # Return mock data for now to avoid database issues
        capacity = self.agent_capacities.get(agent_id, AgentCapacity(agent_id=agent_id))

        return {
            "agent_id": agent_id,
            "name": f"Agent-{agent_id}",
            "type": "full-stack",
            "status": "idle",
            "is_active": True,
            "is_healthy": capacity.is_healthy,
            "current_tasks": capacity.current_tasks,
            "max_concurrent_tasks": capacity.max_concurrent_tasks,
            "cpu_usage": capacity.cpu_usage_percent,
            "memory_usage": capacity.memory_usage_mb,
            "average_task_duration": capacity.average_task_duration,
            "last_health_check": capacity.last_health_check,
            "success_rate": 95.0,
        }

    async def get_tenant_agents(self, tenant_id: int) -> List[Dict[str, Any]]:
        """Get all agents for a tenant with their status."""
        # Return mock data for now to avoid database issues
        mock_agents = []
        for i in range(3):  # Return 3 mock agents
            agent_id = tenant_id * 100 + i  # Generate unique agent IDs
            status = await self.get_agent_status(agent_id)
            mock_agents.append(status)

        return mock_agents

    async def scale_agent(self, agent_id: int, max_concurrent_tasks: int) -> bool:
        """Scale an agent's capacity."""
        if agent_id not in self.agent_capacities:
            self.agent_capacities[agent_id] = AgentCapacity(agent_id=agent_id)

        self.agent_capacities[agent_id].max_concurrent_tasks = max_concurrent_tasks
        logger.info(
            f"Scaled agent {agent_id} to {max_concurrent_tasks} concurrent tasks"
        )
        return True

    async def pause_agent(self, agent_id: int, db: AsyncSession) -> bool:
        """Pause an agent (stop accepting new tasks)."""
        agent = await db.get(Agent, agent_id)

        if agent:
            agent.status = AgentStatus.PAUSED
            await db.commit()
            logger.info(f"Paused agent {agent_id}")
            return True
        return False

    async def resume_agent(self, agent_id: int, db: AsyncSession) -> bool:
        """Resume a paused agent."""
        agent = await db.get(Agent, agent_id)

        if agent:
            agent.status = AgentStatus.IDLE
            await db.commit()
            logger.info(f"Resumed agent {agent_id}")
            return True
        return False

    async def get_task_status(self, task_id: UUID) -> Dict[str, Any]:
        """Get status of a specific task."""
        # Check running tasks first
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
            return {
                "task_id": str(task_id),
                "status": task.status,
                "assigned_agent_id": task.assigned_agent_id,
                "created_at": task.created_at,
                "started_at": task.started_at,
                "progress": self._calculate_task_progress(task),
            }

        # Check queued tasks
        for priority_queue in self.task_queue.values():
            for task in priority_queue:
                if task.id == task_id:
                    return {
                        "task_id": str(task_id),
                        "status": task.status,
                        "queue_position": priority_queue.index(task),
                        "created_at": task.created_at,
                    }

        return {"task_id": str(task_id), "status": "not_found"}

    async def cancel_task(self, task_id: UUID) -> bool:
        """Cancel a task."""
        # Remove from queue if pending
        for priority_queue in self.task_queue.values():
            for task in priority_queue:
                if task.id == task_id:
                    task.status = TaskStatus.CANCELLED
                    priority_queue.remove(task)
                    logger.info(f"Cancelled queued task {task_id}")
                    return True

        # Cancel running task
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
            task.status = TaskStatus.CANCELLED
            # Signal agent to stop task
            await self._signal_task_cancellation(task)
            logger.info(f"Cancelled running task {task_id}")
            return True

        return False

    async def _task_scheduler(self):
        """Background task scheduler."""
        while self._orchestrator_running:
            try:
                await self._schedule_next_tasks()
                await asyncio.sleep(1)  # Check every second
            except Exception as e:
                logger.error(f"Error in task scheduler: {e}")
                await asyncio.sleep(5)

    async def _schedule_next_tasks(self):
        """Schedule next available tasks to available agents."""
        # Process tasks by priority
        for priority in [
            TaskPriority.CRITICAL,
            TaskPriority.HIGH,
            TaskPriority.NORMAL,
            TaskPriority.LOW,
        ]:
            queue = self.task_queue[priority]

            # Process tasks in queue
            tasks_to_remove = []
            for task in queue:
                if await self._can_schedule_task(task):
                    agent = await self._find_best_agent(task)
                    if agent:
                        await self._assign_task_to_agent(task, agent)
                        tasks_to_remove.append(task)

            # Remove scheduled tasks from queue
            for task in tasks_to_remove:
                queue.remove(task)

    async def _can_schedule_task(self, task: AgentTask) -> bool:
        """Check if a task can be scheduled (dependencies met, etc.)."""
        # Check dependencies
        for dep_id in task.dependencies:
            if dep_id in self.running_tasks:
                dep_task = self.running_tasks[dep_id]
                if dep_task.status != TaskStatus.COMPLETED:
                    return False

        return True

    async def _find_best_agent(self, task: AgentTask) -> Optional[int]:
        """Find the best available agent for a task."""
        # Simplified agent selection for now to avoid database issues
        # Return a mock agent ID based on tenant
        mock_agent_id = task.tenant_id * 100  # Generate a consistent agent ID

        # Ensure agent capacity exists
        if mock_agent_id not in self.agent_capacities:
            self.agent_capacities[mock_agent_id] = AgentCapacity(agent_id=mock_agent_id)

        capacity = self.agent_capacities[mock_agent_id]

        # Check if agent can take more tasks
        if capacity.current_tasks >= capacity.max_concurrent_tasks:
            return None

        return mock_agent_id

    def _calculate_agent_score(self, capacity: AgentCapacity, task: AgentTask) -> float:
        """Calculate agent suitability score for a task."""
        # Factors: current load, performance history, resource usage
        load_factor = 1.0 - (capacity.current_tasks / capacity.max_concurrent_tasks)
        performance_factor = 1.0 / (
            capacity.average_task_duration + 1
        )  # Prefer faster agents
        resource_factor = 1.0 - (capacity.cpu_usage_percent / 100.0)

        return load_factor * 0.4 + performance_factor * 0.3 + resource_factor * 0.3

    async def _assign_task_to_agent(self, task: AgentTask, agent_id: int):
        """Assign a task to an agent."""
        task.assigned_agent_id = agent_id
        task.assigned_at = datetime.utcnow()
        task.status = TaskStatus.ASSIGNED

        # Update agent capacity
        if agent_id not in self.agent_capacities:
            self.agent_capacities[agent_id] = AgentCapacity(agent_id=agent_id)

        self.agent_capacities[agent_id].current_tasks += 1
        self.running_tasks[task.id] = task

        # Start task execution
        asyncio.create_task(self._execute_task(task))

        logger.info(f"Assigned task {task.id} to agent {agent_id}")

    async def _execute_task(self, task: AgentTask):
        """Execute a task on an agent."""
        try:
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.utcnow()

            # Simulate task execution (replace with actual agent execution)
            await asyncio.sleep(2)  # Placeholder for actual task execution

            # Mark task as completed
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            task.result = {
                "status": "success",
                "message": "Task completed successfully",
            }

            logger.info(f"Task {task.id} completed successfully")

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()

            logger.error(f"Task {task.id} failed: {e}")

            # Retry logic
            if task.retry_count < task.max_retries:
                task.retry_count += 1
                task.status = TaskStatus.PENDING
                # Re-queue for retry
                self.task_queue[task.priority].append(task)

        finally:
            # Clean up
            if task.assigned_agent_id:
                capacity = self.agent_capacities.get(task.assigned_agent_id)
                if capacity:
                    capacity.current_tasks = max(0, capacity.current_tasks - 1)

            # Remove from running tasks if completed or failed permanently
            if task.status in [
                TaskStatus.COMPLETED,
                TaskStatus.FAILED,
                TaskStatus.CANCELLED,
            ]:
                self.running_tasks.pop(task.id, None)

    async def _health_monitor(self):
        """Monitor agent health."""
        while self._orchestrator_running:
            try:
                await self._check_agent_health()
                await asyncio.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logger.error(f"Error in health monitor: {e}")
                await asyncio.sleep(60)

    async def _check_agent_health(self):
        """Check health of all agents."""
        # Simplified health check for now to avoid database issues
        for agent_id, capacity in self.agent_capacities.items():
            # Simulate health check (replace with actual health check)
            capacity.is_healthy = True  # Placeholder
            capacity.last_health_check = datetime.utcnow()

    async def _resource_optimizer(self):
        """Optimize resource allocation."""
        while self._orchestrator_running:
            try:
                await self._optimize_resources()
                await asyncio.sleep(300)  # Optimize every 5 minutes
            except Exception as e:
                logger.error(f"Error in resource optimizer: {e}")
                await asyncio.sleep(600)

    async def _optimize_resources(self):
        """Optimize resource allocation across agents."""
        # Analyze current load and adjust agent capacities
        for agent_id, capacity in self.agent_capacities.items():
            # If agent is consistently overloaded, consider scaling up
            if capacity.current_tasks >= capacity.max_concurrent_tasks * 0.8:
                # Could trigger auto-scaling logic here
                logger.info(f"Agent {agent_id} is running at high capacity")

    def _calculate_task_progress(self, task: AgentTask) -> float:
        """Calculate task progress percentage."""
        if task.status == TaskStatus.COMPLETED:
            return 100.0
        elif task.status == TaskStatus.RUNNING:
            # Estimate based on average duration
            if task.started_at:
                elapsed = (datetime.utcnow() - task.started_at).total_seconds()
                capacity = self.agent_capacities.get(task.assigned_agent_id)
                if capacity and capacity.average_task_duration > 0:
                    return min(90.0, (elapsed / capacity.average_task_duration) * 100)
            return 10.0
        return 0.0

    async def _signal_task_cancellation(self, task: AgentTask):
        """Signal an agent to cancel a running task."""
        # Placeholder for actual cancellation signaling
        logger.info(f"Signaling cancellation for task {task.id}")

    async def _validate_task(self, task: AgentTask) -> bool:
        """Validate a task before submission."""
        # Simplified validation for now to avoid database issues
        if not task.tenant_id or not task.agent_type or not task.task_type:
            return False

        return True


# Global orchestrator instance
orchestrator = AgentOrchestrator()


async def get_orchestrator() -> AgentOrchestrator:
    """Get the global orchestrator instance."""
    return orchestrator
