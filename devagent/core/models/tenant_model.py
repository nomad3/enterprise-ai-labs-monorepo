"""
Tenant model for multi-tenant support.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, Integer, String, Boolean, JSON
from sqlalchemy.orm import relationship

from devagent.core.base import Base


class ResourceQuota(BaseModel):
    cpu_cores: int = Field(default=2, description="Number of CPU cores allocated")
    memory_gb: int = Field(default=4, description="Memory allocation in GB")
    storage_gb: int = Field(default=50, description="Storage allocation in GB")
    max_users: int = Field(default=100, description="Maximum number of users allowed")


class Tenant(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Name of the tenant")
    status: str = Field(default="active", description="Tenant status (active, suspended, etc.)")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resource_quota: ResourceQuota = Field(default_factory=ResourceQuota)
    admin_users: List[UUID] = Field(default_factory=list, description="List of admin user IDs")
    api_keys: List[dict] = Field(default_factory=list, description="List of API keys")
    compliance_status: dict = Field(
        default_factory=lambda: {
            "soc2": "pending",
            "iso27001": "pending",
            "gdpr": "pending"
        }
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Acme Corp",
                "status": "active",
                "resource_quota": {
                    "cpu_cores": 4,
                    "memory_gb": 8,
                    "storage_gb": 100,
                    "max_users": 250
                }
            }
        }


class Tenant(Base):
    """Tenant model for multi-tenant support."""

    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    settings = Column(JSON, nullable=True)
    compliance_status = Column(JSON, nullable=True)
    max_agents = Column(Integer, default=100)
    max_users = Column(Integer, default=100)
    max_storage_gb = Column(Integer, default=100)
    subscription_tier = Column(String, default="basic")  # basic, pro, enterprise
    subscription_status = Column(String, default="active")  # active, suspended, cancelled
    subscription_expires_at = Column(DateTime, nullable=True)
    custom_domain = Column(String, nullable=True)
    sso_provider = Column(String, nullable=True)  # okta, azure, google, etc.
    sso_config = Column(JSON, nullable=True)
    audit_log_retention_days = Column(Integer, default=365)
    data_retention_days = Column(Integer, default=90)
    allowed_origins = Column(JSON, nullable=True)
    allowed_ips = Column(JSON, nullable=True)
    rate_limit_requests = Column(Integer, default=100)
    rate_limit_window = Column(Integer, default=60)
    enable_2fa = Column(Boolean, default=True)
    enable_audit_logging = Column(Boolean, default=True)
    enable_compliance = Column(Boolean, default=True)
    enable_rate_limiting = Column(Boolean, default=True)
    enable_ip_restriction = Column(Boolean, default=False)
    enable_sso = Column(Boolean, default=False)
    enable_custom_domain = Column(Boolean, default=False)
    enable_advanced_features = Column(Boolean, default=False)

    # Relationships
    users = relationship("User", back_populates="tenant")
    agents = relationship("Agent", back_populates="tenant")
    audit_logs = relationship("AuditLog", back_populates="tenant")

    def __repr__(self):
        """String representation of the tenant."""
        return f"<Tenant {self.name}>"

    @property
    def is_compliant(self) -> bool:
        """Check if the tenant is compliant with all required frameworks."""
        if not self.compliance_status:
            return False
        return all(
            status.get("status") == "compliant"
            for status in self.compliance_status.values()
        )

    @property
    def subscription_is_active(self) -> bool:
        """Check if the tenant's subscription is active."""
        if not self.subscription_expires_at:
            return True
        return self.subscription_expires_at > datetime.utcnow()

    def can_create_agent(self) -> bool:
        """Check if the tenant can create a new agent."""
        if not self.is_active:
            return False
        if not self.subscription_is_active:
            return False
        return len(self.agents) < self.max_agents

    def can_create_user(self) -> bool:
        """Check if the tenant can create a new user."""
        if not self.is_active:
            return False
        if not self.subscription_is_active:
            return False
        return len(self.users) < self.max_users 