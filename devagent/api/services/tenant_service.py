from datetime import datetime
from typing import List, Optional

from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from AgentProvision.api.schemas.tenant import TenantCreate, TenantUpdate
from AgentProvision.core.models.tenant_model import Tenant


async def create_tenant(db: AsyncSession, tenant_in: TenantCreate) -> Tenant:
    # Ensure slug is provided or generated if not part of TenantCreate
    # For now, assuming TenantCreate includes slug as per schema
    tenant_data = tenant_in.dict()
    if not tenant_data.get("slug"):  # Basic slug generation if not provided
        tenant_data["slug"] = (
            tenant_data["name"].lower().replace(" ", "-").replace("_", "-")
        )

    tenant = Tenant(**tenant_data)
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant


async def get_tenant(db: AsyncSession, tenant_id: int) -> Optional[Tenant]:
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    return result.scalar_one_or_none()


async def list_tenants(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    name_filter: Optional[str] = None,
    is_active_filter: Optional[bool] = None,
    subscription_tier_filter: Optional[str] = None,
) -> List[Tenant]:
    query = select(Tenant)
    conditions = []
    if name_filter:
        conditions.append(Tenant.name.ilike(f"%{name_filter}%"))
    if is_active_filter is not None:
        conditions.append(Tenant.is_active == is_active_filter)
    if subscription_tier_filter:
        conditions.append(Tenant.subscription_tier == subscription_tier_filter)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def update_tenant(
    db: AsyncSession, tenant_id: int, tenant_in: TenantUpdate
) -> Tenant:
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
