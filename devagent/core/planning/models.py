"""
Models for the Solution Planning & Strategy Module.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import (
    BaseModel as PydanticBaseModel,
)  # Added for Pydantic response models
from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from devagent.core.database import Base


class TaskPriority(str, Enum):
    """Priority levels for tasks."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TaskStatus(str, Enum):
    """Possible statuses for a task."""

    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    DONE = "DONE"
    BLOCKED = "BLOCKED"


class Task(Base):
    """Model representing a task in a solution plan."""

    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True)
    plan_id = Column(String(50), ForeignKey("solution_plans.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    priority = Column(SQLEnum(TaskPriority), nullable=False)
    status = Column(SQLEnum(TaskStatus), nullable=False, default=TaskStatus.TODO)
    estimated_effort = Column(Integer)  # in hours
    dependencies = Column(String(500))  # Comma-separated list of task IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    plan = relationship("SolutionPlan", back_populates="tasks")


class SolutionPlan(Base):
    """Model representing a solution plan for a ticket."""

    __tablename__ = "solution_plans"

    id = Column(String(50), primary_key=True)
    ticket_id = Column(
        String(50), nullable=False
    )  # This should ideally be ForeignKey to tickets.id
    summary = Column(Text)
    total_estimated_effort = Column(Integer)  # in hours
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="plan", cascade="all, delete-orphan")


# Pydantic models for API responses


class TaskResponse(PydanticBaseModel):
    id: str
    plan_id: str
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    status: TaskStatus
    estimated_effort: Optional[int] = None
    dependencies: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class SolutionPlanResponse(PydanticBaseModel):
    id: str
    ticket_id: str
    summary: Optional[str] = None
    total_estimated_effort: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskResponse] = []

    class Config:
        orm_mode = True
