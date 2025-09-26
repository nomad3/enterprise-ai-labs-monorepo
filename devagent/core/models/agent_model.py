"""
Agent model for multi-agent support.
"""

import enum
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import (JSON, Boolean, Column, DateTime, Enum, ForeignKey,
                        Integer, String)
from sqlalchemy.orm import relationship

from devagent.core.base import Base


class AgentType(enum.Enum):
    """Types of agents supported by the platform."""

    FULL_STACK = "full_stack"
    DEVOPS = "devops"
    QA = "qa"
    DATA_ANALYSIS = "data_analysis"
    BUSINESS_INTELLIGENCE = "business_intelligence"
    SECURITY = "security"
    DOCUMENTATION = "documentation"


class AgentStatus(enum.Enum):
    """Status of an agent."""

    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    UPDATING = "updating"
    MAINTENANCE = "maintenance"


class AgentResources(BaseModel):
    """Pydantic model for agent resource allocation."""

    model_config = ConfigDict(extra="allow")

    cpu_cores: float = Field(default=1.0, description="CPU cores allocated")
    memory_mb: int = Field(default=512, description="Memory in MB")
    max_concurrent_tasks: int = Field(default=5, description="Maximum concurrent tasks")


class AgentResponse(BaseModel):
    """Pydantic model for API responses."""

    model_config = ConfigDict(from_attributes=True, extra="allow")

    id: int
    name: str
    agent_type: str
    description: Optional[str] = None
    is_active: bool = True
    status: str = "idle"
    created_at: datetime
    updated_at: datetime
    version: str = "1.0.0"
    tenant_id: int


class AgentCreate(BaseModel):
    """Pydantic model for creating agents."""

    model_config = ConfigDict(extra="allow")

    name: str = Field(..., description="Name of the agent")
    agent_type: str = Field(..., description="Type of the agent")
    description: Optional[str] = Field(None, description="Description of the agent")
    config: Optional[Dict[str, Any]] = Field(None, description="Agent configuration")


class Agent(Base):
    """Agent model for multi-agent support."""

    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    agent_type = Column(
        String, nullable=False
    )  # e.g., devops, qa, data, security, etc.
    description = Column(String, nullable=True)
    config = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = Column(String, default="1.0.0")
    status = Column(String, default="idle")  # idle, running, error, etc.
    last_run_at = Column(DateTime, nullable=True)
    last_active = Column(DateTime, nullable=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)

    # Performance metrics
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    total_execution_time = Column(Integer, default=0)  # milliseconds
    average_response_time = Column(Integer, default=0)  # milliseconds
    last_error = Column(String, nullable=True)
    last_error_at = Column(DateTime, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="agents")

    def __repr__(self):
        return f"<Agent {self.name} ({self.agent_type})>"

    @property
    def is_healthy(self) -> bool:
        """Check if the agent is healthy."""
        if not self.is_active:
            return False
        if self.status == AgentStatus.ERROR.value:
            return False
        if self.error_count > 100:  # Arbitrary threshold
            return False
        return True

    @property
    def success_rate(self) -> float:
        """Calculate the success rate of the agent."""
        total = self.success_count + self.error_count
        if total == 0:
            return 0.0
        return (self.success_count / total) * 100

    @property
    def average_execution_time(self) -> float:
        """Calculate the average execution time."""
        if self.success_count == 0:
            return 0.0
        return self.total_execution_time / self.success_count

    def increment_error(self, error_message: str):
        """Increment error count and update last error."""
        self.error_count += 1
        self.last_error = error_message
        self.last_error_at = datetime.utcnow()
        if self.error_count > 100:  # Arbitrary threshold
            self.status = AgentStatus.ERROR.value

    def increment_success(self, execution_time: int):
        """Increment success count and update metrics."""
        self.success_count += 1
        self.total_execution_time += execution_time
        self.average_response_time = (
            self.average_response_time * (self.success_count - 1) + execution_time
        ) / self.success_count
        self.last_active = datetime.utcnow()


class AgentTask(Base):
    """Model for tracking agent tasks."""

    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    task_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    execution_time = Column(Integer, nullable=True)  # milliseconds
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent = relationship("Agent")

    def __repr__(self):
        """String representation of the task."""
        return f"<AgentTask {self.id} ({self.task_type})>"


class AgentLog(Base):
    """Model for agent logs."""

    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    level = Column(String, nullable=False)  # INFO, WARNING, ERROR, DEBUG
    message = Column(String, nullable=False)
    log_metadata = Column(JSON, nullable=True)  # Renamed from metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    agent = relationship("Agent")

    def __repr__(self):
        """String representation of the log."""
        return f"<AgentLog {self.id} ({self.level})>"
