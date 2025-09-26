"""
SQLAlchemy and Pydantic models for User and Authentication.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from AgentProvision.core.base import Base


# SQLAlchemy User Model
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")


# Pydantic models
class UserBase(BaseModel):
    model_config = ConfigDict(extra="allow")

    email: EmailStr = Field(..., example="user@example.com")
    full_name: Optional[str] = Field(None, example="John Doe")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="strongpassword123")


class UserUpdate(UserBase):
    password: Optional[str] = Field(None, min_length=8, example="newstrongpassword123")
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class UserInDBBase(UserBase):
    model_config = ConfigDict(from_attributes=True, extra="allow")

    id: uuid.UUID
    is_active: bool
    is_superuser: bool
    tenant_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class UserResponse(UserInDBBase):  # For sending user data to client (without password)
    pass


class Token(BaseModel):
    model_config = ConfigDict(extra="allow")

    access_token: str
    token_type: str


class TokenData(BaseModel):
    model_config = ConfigDict(extra="allow")

    email: Optional[EmailStr] = None


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    email: EmailStr
    password: str
