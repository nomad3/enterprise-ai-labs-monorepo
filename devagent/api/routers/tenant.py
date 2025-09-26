from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from AgentProvision.api.schemas.tenant import TenantCreate, TenantRead, TenantUpdate
from AgentProvision.api.services.tenant_service import (create_tenant, delete_tenant,
                                                  get_tenant, list_tenants,
                                                  update_tenant)
from AgentProvision.core.database import get_session

router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.post("/", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
async def create_tenant_endpoint(
    tenant: TenantCreate, db: AsyncSession = Depends(get_session)
):
    # Consider adding checks for duplicate slug/name here or in service layer
    # if they need to be unique and are not handled by DB constraints directly for API responses
    return await create_tenant(db, tenant)


@router.get("/", response_model=List[TenantRead])
async def list_tenants_endpoint(
    db: AsyncSession = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),  # Max limit 200
    name_filter: Optional[str] = Query(None, alias="name"),
    is_active_filter: Optional[bool] = Query(None, alias="isActive"),
    subscription_tier_filter: Optional[str] = Query(None, alias="subscriptionTier"),
):
    return await list_tenants(
        db,
        skip=skip,
        limit=limit,
        name_filter=name_filter,
        is_active_filter=is_active_filter,
        subscription_tier_filter=subscription_tier_filter,
    )


@router.get("/{tenant_id}", response_model=TenantRead)
async def get_tenant_endpoint(tenant_id: int, db: AsyncSession = Depends(get_session)):
    tenant = await get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=TenantRead)
async def update_tenant_endpoint(
    tenant_id: int, tenant: TenantUpdate, db: AsyncSession = Depends(get_session)
):
    return await update_tenant(db, tenant_id, tenant)


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant_endpoint(
    tenant_id: int, db: AsyncSession = Depends(get_session)
):
    await delete_tenant(db, tenant_id)
    return None
