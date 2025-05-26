"""
SQLAlchemy and Pydantic models for User and Authentication.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from devagent.core.database import Base


# SQLAlchemy User Model
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Add relationships if needed, e.g., tickets created by user
    # tickets = relationship("Ticket", back_populates="owner")


# Pydantic models
class UserBase(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    full_name: str | None = Field(None, example="John Doe")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="strongpassword123")


class UserUpdate(UserBase):
    password: str | None = Field(None, min_length=8, example="newstrongpassword123")
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserInDBBase(UserBase):
    id: uuid.UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(UserInDBBase):  # For sending user data to client (without password)
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: EmailStr | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
