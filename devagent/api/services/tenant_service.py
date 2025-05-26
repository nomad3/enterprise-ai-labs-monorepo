from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from devagent.core.models.tenant_model import Tenant
from devagent.api.schemas.tenant import TenantCreate, TenantUpdate
from typing import List, Optional
from datetime import datetime

async def create_tenant(db: AsyncSession, tenant_in: TenantCreate) -> Tenant:
    tenant = Tenant(**tenant_in.dict())
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant

async def get_tenant(db: AsyncSession, tenant_id: int) -> Optional[Tenant]:
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    return result.scalar_one_or_none()

async def list_tenants(db: AsyncSession) -> List[Tenant]:
    result = await db.execute(select(Tenant))
    return result.scalars().all()

async def update_tenant(db: AsyncSession, tenant_id: int, tenant_in: TenantUpdate) -> Tenant:
    tenant = await get_tenant(db, tenant_id)
    if not tenant:
        raise ValueError("Tenant not found")
    for field, value in tenant_in.dict(exclude_unset=True).items():
        setattr(tenant, field, value)
    tenant.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(tenant)
    return tenant

async def delete_tenant(db: AsyncSession, tenant_id: int) -> None:
    tenant = await get_tenant(db, tenant_id)
    if not tenant:
        raise ValueError("Tenant not found")
    await db.delete(tenant)
    await db.commit() 