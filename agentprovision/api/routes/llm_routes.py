"""
API routes for LLM Engine Service.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from agentprovision.api.auth import get_current_user_dependency
from agentprovision.core.database import get_session
from agentprovision.core.models.user_model import User
from agentprovision.core.services.llm_engine import (LLMEngine, LLMModel,
                                                     LLMRequest, LLMResponse,
                                                     LLMUsageMetrics,
                                                     get_llm_engine)

router = APIRouter(prefix="/llm", tags=["LLM Engine"])


@router.get("/models", response_model=List[LLMModel])
async def get_available_models(
    current_user: User = Depends(get_current_user_dependency),
    llm_engine: LLMEngine = Depends(get_llm_engine),
):
    """Get all available LLM models."""
    try:
        models = await llm_engine.get_available_models()
        return models
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get models: {str(e)}",
        )


@router.post("/generate", response_model=LLMResponse)
async def generate_text(
    request: LLMRequest,
    current_user: User = Depends(get_current_user_dependency),
    llm_engine: LLMEngine = Depends(get_llm_engine),
):
    """Generate text using LLM."""
    try:
        # Set tenant ID from current user
        if current_user.tenant_id:
            request.tenant_id = current_user.tenant_id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must be associated with a tenant",
            )

        response = await llm_engine.generate(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate text: {str(e)}",
        )


@router.get("/usage/{tenant_id}", response_model=Optional[LLMUsageMetrics])
async def get_tenant_usage(
    tenant_id: int,
    current_user: User = Depends(get_current_user_dependency),
    llm_engine: LLMEngine = Depends(get_llm_engine),
):
    """Get LLM usage metrics for a tenant."""
    try:
        # Check if user has access to this tenant
        if current_user.tenant_id != tenant_id and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to tenant data",
            )

        usage = await llm_engine.get_tenant_usage(tenant_id)
        return usage
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage metrics: {str(e)}",
        )


@router.post("/routing-strategy")
async def set_routing_strategy(
    strategy: str,
    current_user: User = Depends(get_current_user_dependency),
    llm_engine: LLMEngine = Depends(get_llm_engine),
):
    """Set LLM routing strategy."""
    try:
        # Only superusers can change routing strategy
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only superusers can change routing strategy",
            )

        await llm_engine.set_routing_strategy(strategy)
        return {"message": f"Routing strategy set to: {strategy}"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set routing strategy: {str(e)}",
        )
