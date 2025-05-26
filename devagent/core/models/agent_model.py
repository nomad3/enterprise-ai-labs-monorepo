"""
Agent model for multi-agent support.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Integer, String, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

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

    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    UPDATING = "updating"
    MAINTENANCE = "maintenance"


class Agent(Base):
    """Agent model for multi-agent support."""

    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    agent_type = Column(String, nullable=False)  # e.g., devops, qa, data, security, etc.
    description = Column(String, nullable=True)
    config = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = Column(String, default="1.0.0")
    status = Column(String, default="idle")  # idle, running, error, etc.
    last_run_at = Column(DateTime, nullable=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="agents")

    def __repr__(self):
        return f"<Agent {self.name} ({self.agent_type})>"

    @property
    def is_healthy(self) -> bool:
        """Check if the agent is healthy."""
        if not self.is_active:
            return False
        if self.status == AgentStatus.ERROR:
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
            self.status = AgentStatus.ERROR

    def increment_success(self, execution_time: int):
        """Increment success count and update metrics."""
        self.success_count += 1
        self.total_execution_time += execution_time
        self.average_response_time = (
            (self.average_response_time * (self.success_count - 1) + execution_time)
            / self.success_count
        )
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
    agent = relationship("Agent", back_populates="tasks")

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
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    agent = relationship("Agent", back_populates="logs")

    def __repr__(self):
        """String representation of the log."""
        return f"<AgentLog {self.id} ({self.level})>" 