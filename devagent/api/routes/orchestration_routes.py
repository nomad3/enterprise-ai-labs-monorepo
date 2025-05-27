"""
API routes for Agent Orchestration Service.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from devagent.core.services.agent_orchestrator import (
    get_orchestrator, 
    AgentOrchestrator, 
    AgentTask, 
    WorkflowDefinition,
    TaskPriority,
    TaskStatus
)
from devagent.api.auth import get_current_user_dependency
from devagent.core.models.user_model import User
from devagent.core.models.tenant_model import Tenant
from devagent.core.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

router = APIRouter()


class TaskSubmissionRequest(BaseModel):
    """Request model for task submission."""
    agent_type: str = Field(..., description="Type of agent to execute the task")
    task_type: str = Field(..., description="Type of task to execute")
    priority: TaskPriority = Field(default=TaskPriority.NORMAL, description="Task priority")
    payload: Dict[str, Any] = Field(..., description="Task payload/parameters")
    timeout_seconds: int = Field(default=300, description="Task timeout in seconds")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    dependencies: List[UUID] = Field(default_factory=list, description="Task dependencies")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class WorkflowSubmissionRequest(BaseModel):
    """Request model for workflow submission."""
    name: str = Field(..., description="Workflow name")
    description: str = Field(..., description="Workflow description")
    steps: List[Dict[str, Any]] = Field(..., description="Workflow steps")
    triggers: List[Dict[str, Any]] = Field(default_factory=list, description="Workflow triggers")


class AgentScalingRequest(BaseModel):
    """Request model for agent scaling."""
    max_concurrent_tasks: int = Field(..., ge=1, le=100, description="Maximum concurrent tasks")


class TaskResponse(BaseModel):
    """Response model for task operations."""
    task_id: str
    status: str
    message: str


class WorkflowResponse(BaseModel):
    """Response model for workflow operations."""
    workflow_id: str
    status: str
    message: str


@router.post("/orchestration/tasks", response_model=TaskResponse)
async def submit_task(
    request: TaskSubmissionRequest,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator),
    db: AsyncSession = Depends(get_session)
):
    """Submit a new task for execution."""
    try:
        # Get user's tenant
        result = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
        tenant = result.scalars().first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
        
        # Create task
        task = AgentTask(
            tenant_id=tenant.id,
            agent_type=request.agent_type,
            task_type=request.task_type,
            priority=request.priority,
            payload=request.payload,
            timeout_seconds=request.timeout_seconds,
            max_retries=request.max_retries,
            dependencies=request.dependencies,
            metadata=request.metadata
        )
        
        # Submit task
        task_id = await orchestrator.submit_task(task)
        
        return TaskResponse(
            task_id=str(task_id),
            status="submitted",
            message="Task submitted successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit task: {str(e)}"
        )


@router.post("/orchestration/workflows", response_model=WorkflowResponse)
async def submit_workflow(
    request: WorkflowSubmissionRequest,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator),
    db: AsyncSession = Depends(get_session)
):
    """Submit a new workflow for execution."""
    try:
        # Get user's tenant
        result = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
        tenant = result.scalars().first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
        
        # Create workflow
        workflow = WorkflowDefinition(
            name=request.name,
            description=request.description,
            tenant_id=tenant.id,
            steps=request.steps,
            triggers=request.triggers
        )
        
        # Submit workflow
        workflow_id = await orchestrator.submit_workflow(workflow)
        
        return WorkflowResponse(
            workflow_id=str(workflow_id),
            status="submitted",
            message="Workflow submitted successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit workflow: {str(e)}"
        )


@router.get("/orchestration/tasks/{task_id}")
async def get_task_status(
    task_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Get status of a specific task."""
    try:
        task_status = await orchestrator.get_task_status(task_id)
        
        if task_status.get("status") == "not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return task_status
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task status: {str(e)}"
        )


@router.delete("/orchestration/tasks/{task_id}")
async def cancel_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Cancel a task."""
    try:
        success = await orchestrator.cancel_task(task_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or cannot be cancelled"
            )
        
        return {"message": "Task cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel task: {str(e)}"
        )


@router.get("/orchestration/agents")
async def get_tenant_agents(
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator),
    db: AsyncSession = Depends(get_session)
):
    """Get all agents for the current tenant with their status."""
    try:
        # Get user's tenant
        result = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
        tenant = result.scalars().first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
        
        agents = await orchestrator.get_tenant_agents(tenant.id)
        return {"agents": agents}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agents: {str(e)}"
        )


@router.get("/orchestration/agents/{agent_id}")
async def get_agent_status(
    agent_id: int,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Get detailed status of a specific agent."""
    try:
        agent_status = await orchestrator.get_agent_status(agent_id)
        return agent_status
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent status: {str(e)}"
        )


@router.post("/orchestration/agents/{agent_id}/scale")
async def scale_agent(
    agent_id: int,
    request: AgentScalingRequest,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Scale an agent's capacity."""
    try:
        success = await orchestrator.scale_agent(agent_id, request.max_concurrent_tasks)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        return {
            "message": f"Agent {agent_id} scaled to {request.max_concurrent_tasks} concurrent tasks"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to scale agent: {str(e)}"
        )


@router.post("/orchestration/agents/{agent_id}/pause")
async def pause_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Pause an agent (stop accepting new tasks)."""
    try:
        success = await orchestrator.pause_agent(agent_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        return {"message": f"Agent {agent_id} paused successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to pause agent: {str(e)}"
        )


@router.post("/orchestration/agents/{agent_id}/resume")
async def resume_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator)
):
    """Resume a paused agent."""
    try:
        success = await orchestrator.resume_agent(agent_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        return {"message": f"Agent {agent_id} resumed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resume agent: {str(e)}"
        )


@router.get("/orchestration/metrics")
async def get_orchestration_metrics(
    current_user: User = Depends(get_current_user_dependency),
    orchestrator: AgentOrchestrator = Depends(get_orchestrator),
    db: AsyncSession = Depends(get_session)
):
    """Get orchestration metrics for the current tenant."""
    try:
        # Get user's tenant
        result = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
        tenant = result.scalars().first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
        
        # Get agents for tenant
        agents = await orchestrator.get_tenant_agents(tenant.id)
        
        # Calculate metrics
        total_agents = len(agents)
        active_agents = len([a for a in agents if a["is_active"]])
        healthy_agents = len([a for a in agents if a["is_healthy"]])
        total_current_tasks = sum(a["current_tasks"] for a in agents)
        total_max_tasks = sum(a["max_concurrent_tasks"] for a in agents)
        
        # Task queue metrics
        total_queued_tasks = sum(len(queue) for queue in orchestrator.task_queue.values())
        total_running_tasks = len(orchestrator.running_tasks)
        
        # Calculate utilization
        utilization = (total_current_tasks / total_max_tasks * 100) if total_max_tasks > 0 else 0
        
        return {
            "tenant_id": tenant.id,
            "agents": {
                "total": total_agents,
                "active": active_agents,
                "healthy": healthy_agents,
                "utilization_percent": round(utilization, 2)
            },
            "tasks": {
                "queued": total_queued_tasks,
                "running": total_running_tasks,
                "queue_breakdown": {
                    "critical": len(orchestrator.task_queue[TaskPriority.CRITICAL]),
                    "high": len(orchestrator.task_queue[TaskPriority.HIGH]),
                    "normal": len(orchestrator.task_queue[TaskPriority.NORMAL]),
                    "low": len(orchestrator.task_queue[TaskPriority.LOW])
                }
            },
            "capacity": {
                "current_tasks": total_current_tasks,
                "max_tasks": total_max_tasks,
                "available_capacity": total_max_tasks - total_current_tasks
            },
            "timestamp": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        ) 