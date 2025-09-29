from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class TenantBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    is_active: Optional[bool] = True
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = "basic"
    custom_domain: Optional[str] = None
    sso_provider: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: Optional[str] = None  # Allow updating name
    description: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = None
    custom_domain: Optional[str] = None
    sso_provider: Optional[str] = None
    # Add other updatable fields from the model as needed, e.g.:
    max_agents: Optional[int] = None
    max_users: Optional[int] = None
    subscription_status: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None


class TenantRead(TenantBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Expose more fields from the model for reading
    compliance_status: Optional[Dict[str, Any]] = None
    max_agents: Optional[int] = None
    max_users: Optional[int] = None
    max_storage_gb: Optional[int] = None
    subscription_status: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None
    sso_config: Optional[Dict[str, Any]] = None
    audit_log_retention_days: Optional[int] = None
    data_retention_days: Optional[int] = None
    # Assuming JSON array of strings
    allowed_origins: Optional[list[str]] = None
    allowed_ips: Optional[list[str]] = None  # Assuming JSON array of strings
    rate_limit_requests: Optional[int] = None
    rate_limit_window: Optional[int] = None
    enable_2fa: Optional[bool] = None
    enable_audit_logging: Optional[bool] = None
    enable_compliance: Optional[bool] = None
    enable_rate_limiting: Optional[bool] = None
    enable_ip_restriction: Optional[bool] = None
    enable_sso: Optional[bool] = None
    enable_custom_domain: Optional[bool] = None
    enable_advanced_features: Optional[bool] = None

    class Config:
        orm_mode = True


class TenantStats(BaseModel):
    activeAgents: int
    totalAgents: int
    totalExecutions: int
    monthlyCost: float
    monthlyTokens: int


class RecentExecution(BaseModel):
    _id: str
    _creationTime: datetime
    input: Optional[str]
    status: str


class TenantOverview(BaseModel):
    tenant: TenantRead
    stats: TenantStats
    agentsByType: Dict[str, int]
    recentExecutions: list[RecentExecution]
