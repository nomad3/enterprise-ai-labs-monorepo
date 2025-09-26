from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AgentBase(BaseModel):
    name: str
    agent_type: str
    description: Optional[str] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = True


class AgentCreate(AgentBase):
    tenant_id: int


class AgentUpdate(BaseModel):
    description: Optional[str] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None


class AgentRead(AgentBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    version: str
    status: str
    last_run_at: Optional[datetime] = None

    class Config:
        orm_mode = True
