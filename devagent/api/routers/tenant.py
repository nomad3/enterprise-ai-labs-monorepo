from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from devagent.api.schemas.tenant import TenantCreate, TenantRead, TenantUpdate
from devagent.api.services.tenant_service import (
    create_tenant, get_tenant, list_tenants, update_tenant, delete_tenant
)
from devagent.core.database import get_session

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("/", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
async def create_tenant_endpoint(
    tenant: TenantCreate, db: AsyncSession = Depends(get_session)
):
    return await create_tenant(db, tenant)

@router.get("/", response_model=List[TenantRead])
async def list_tenants_endpoint(db: AsyncSession = Depends(get_session)):
    return await list_tenants(db)

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
async def delete_tenant_endpoint(tenant_id: int, db: AsyncSession = Depends(get_session)):
    await delete_tenant(db, tenant_id)
    return None 