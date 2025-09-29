"""
API routes for Agent Runtime Service.
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from agentprovision.api.auth import get_current_user_dependency
from agentprovision.core.interfaces.agent_interface import (AgentConfig, Task,
                                                            TaskResult)
from agentprovision.core.models.user_model import User
from agentprovision.core.services.agent_runtime import (AgentRuntime,
                                                        get_agent_runtime)

router = APIRouter(prefix="/runtime", tags=["Agent Runtime"])


class CreateAgentRequest(BaseModel):
    """Request model for creating an agent."""

    name: str
    agent_type: str
    description: Optional[str] = None
    cpu_cores: float = 1.0
    memory_mb: int = 512
    storage_mb: int = 1024
    max_concurrent_tasks: int = 5
    timeout_seconds: int = 300
    retry_attempts: int = 3
    heartbeat_interval: int = 30
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
    llm_temperature: float = 0.7
    llm_max_tokens: Optional[int] = None
    integrations: Dict[str, Dict] = {}
    security_level: str = "standard"
    data_classification: str = "internal"
    parameters: Dict = {}


class ExecuteTaskRequest(BaseModel):
    """Request model for executing a task."""

    task_type: str
    priority: str = "normal"
    input_data: Dict
    context: Dict = {}
    metadata: Dict = {}
    timeout_seconds: Optional[int] = None
    retry_attempts: Optional[int] = None


@router.post("/agents", response_model=Dict[str, str])
async def create_agent(
    request: CreateAgentRequest,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Create a new agent instance."""
    try:
        if not current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must be associated with a tenant",
            )

        # Create agent config
        config = AgentConfig(
            id=f"agent_{current_user.tenant_id}_{request.name}",
            name=request.name,
            agent_type=request.agent_type,
            description=request.description,
            cpu_cores=request.cpu_cores,
            memory_mb=request.memory_mb,
            storage_mb=request.storage_mb,
            max_concurrent_tasks=request.max_concurrent_tasks,
            timeout_seconds=request.timeout_seconds,
            retry_attempts=request.retry_attempts,
            heartbeat_interval=request.heartbeat_interval,
            llm_provider=request.llm_provider,
            llm_model=request.llm_model,
            llm_temperature=request.llm_temperature,
            llm_max_tokens=request.llm_max_tokens,
            integrations=request.integrations,
            security_level=request.security_level,
            data_classification=request.data_classification,
            parameters=request.parameters,
            tenant_id=current_user.tenant_id,
            created_by=str(current_user.id),
        )

        agent_id = await runtime.create_agent(config)
        return {"agent_id": agent_id, "message": "Agent created successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}",
        )


@router.post("/agents/{agent_id}/start")
async def start_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Start an agent."""
    try:
        # Check if user has access to this agent
        agent_status = await runtime.get_agent_status(agent_id)
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        if (
            agent_status["config"]["tenant_id"] != current_user.tenant_id
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to agent"
            )

        success = await runtime.start_agent(agent_id)
        if success:
            return {"message": "Agent started successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to start agent"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start agent: {str(e)}",
        )


@router.post("/agents/{agent_id}/stop")
async def stop_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Stop an agent."""
    try:
        # Check if user has access to this agent
        agent_status = await runtime.get_agent_status(agent_id)
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        if (
            agent_status["config"]["tenant_id"] != current_user.tenant_id
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to agent"
            )

        success = await runtime.stop_agent(agent_id)
        if success:
            return {"message": "Agent stopped successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to stop agent"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to stop agent: {str(e)}",
        )


@router.post("/agents/{agent_id}/restart")
async def restart_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Restart an agent."""
    try:
        # Check if user has access to this agent
        agent_status = await runtime.get_agent_status(agent_id)
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        if (
            agent_status["config"]["tenant_id"] != current_user.tenant_id
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to agent"
            )

        success = await runtime.restart_agent(agent_id)
        if success:
            return {"message": "Agent restarted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to restart agent",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to restart agent: {str(e)}",
        )


@router.delete("/agents/{agent_id}")
async def terminate_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Terminate and remove an agent."""
    try:
        # Check if user has access to this agent
        agent_status = await runtime.get_agent_status(agent_id)
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        if (
            agent_status["config"]["tenant_id"] != current_user.tenant_id
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to agent"
            )

        success = await runtime.terminate_agent(agent_id)
        if success:
            return {"message": "Agent terminated successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to terminate agent",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to terminate agent: {str(e)}",
        )


@router.post("/agents/{agent_id}/execute", response_model=TaskResult)
async def execute_task(
    agent_id: str,
    request: ExecuteTaskRequest,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Execute a task on an agent."""
    try:
        # Check if user has access to this agent
        agent_status = await runtime.get_agent_status(agent_id)
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        if (
            agent_status["config"]["tenant_id"] != current_user.tenant_id
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to agent"
            )

        # Create task
        task = Task(
            agent_id=agent_id,
            tenant_id=current_user.tenant_id,
            task_type=request.task_type,
            priority=request.priority,
            input_data=request.input_data,
            context=request.context,
            metadata=request.metadata,
            timeout_seconds=request.timeout_seconds,
            retry_attempts=request.retry_attempts,
        )

        result = await runtime.execute_task(agent_id, task)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute task: {str(e)}",
        )


@router.get("/agents/{agent_id}/status")
async def get_agent_status(
    agent_id: str,
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Get agent status and metrics."""
    try:
        agent_status = await runtime.get_agent_status(agent_id)
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        if (
            agent_status["config"]["tenant_id"] != current_user.tenant_id
            and not current_user.is_superuser
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to agent"
            )

        return agent_status

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent status: {str(e)}",
        )


@router.get("/agents")
async def list_agents(
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """List all agents for the current tenant."""
    try:
        tenant_id = None if current_user.is_superuser else current_user.tenant_id
        agents = await runtime.list_agents(tenant_id)
        return {"agents": agents}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list agents: {str(e)}",
        )


@router.get("/metrics")
async def get_runtime_metrics(
    current_user: User = Depends(get_current_user_dependency),
    runtime: AgentRuntime = Depends(get_agent_runtime),
):
    """Get runtime-wide metrics."""
    try:
        # Only superusers can see runtime metrics
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only superusers can access runtime metrics",
            )

        metrics = await runtime.get_runtime_metrics()
        return metrics

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get runtime metrics: {str(e)}",
        )
