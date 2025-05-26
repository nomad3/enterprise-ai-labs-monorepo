from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    is_active: Optional[bool] = True
    subscription_tier: Optional[str] = "basic"
    custom_domain: Optional[str] = None
    sso_provider: Optional[str] = None

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    description: Optional[str] = None
    is_active: Optional[bool] = None
    subscription_tier: Optional[str] = None
    custom_domain: Optional[str] = None
    sso_provider: Optional[str] = None

class TenantRead(TenantBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 