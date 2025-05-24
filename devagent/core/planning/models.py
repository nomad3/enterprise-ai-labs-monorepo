"""
Models for the Solution Planning & Strategy Module.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from devagent.core.database import Base


class TaskPriority(str, Enum):
    """Priority levels for tasks."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, Enum):
    """Possible statuses for a task."""

    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"
    BLOCKED = "blocked"


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
    ticket_id = Column(String(50), nullable=False)
    summary = Column(Text)
    total_estimated_effort = Column(Integer)  # in hours
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="plan", cascade="all, delete-orphan")
