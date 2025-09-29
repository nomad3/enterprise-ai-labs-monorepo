import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from agentprovision.api.auth import get_current_user_dependency
from agentprovision.api.schemas.tenant import (RecentExecution, TenantOverview,
                                               TenantRead, TenantStats)
from agentprovision.core.database import get_session
from agentprovision.core.models.user_model import User

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/{tenant_id}", response_model=TenantRead)
async def get_tenant(
    tenant_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user_dependency),
):
    # TODO: Add logic to check if user belongs to the tenant
    # For now, just fetching the tenant
    # This is a placeholder for a proper implementation
    from agentprovision.core.models.tenant_model import Tenant

    tenant = await db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.get("/{tenant_id}/overview", response_model=TenantOverview)
async def get_tenant_overview(
    tenant_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user_dependency),
):
    from agentprovision.core.models.tenant_model import Tenant

    tenant = await db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Mock data for now
    mock_stats = TenantStats(
        activeAgents=random.randint(5, 20),
        totalAgents=random.randint(20, 50),
        totalExecutions=random.randint(1000, 5000),
        monthlyCost=random.uniform(100, 1000),
        monthlyTokens=random.randint(100000, 500000),
    )

    mock_agents_by_type = {
        "chatbot": random.randint(1, 10),
        "data_analyst": random.randint(1, 5),
        "code_generator": random.randint(1, 5),
    }

    mock_recent_executions = [
        RecentExecution(
            _id=str(i),
            _creationTime=datetime.utcnow() - timedelta(minutes=i * 15),
            input=f"Test execution {i}",
            status=random.choice(["completed", "failed", "running"]),
        )
        for i in range(5)
    ]

    return TenantOverview(
        tenant=tenant,
        stats=mock_stats,
        agentsByType=mock_agents_by_type,
        recentExecutions=mock_recent_executions,
    )
