"""
Models for the Ticket Ingestion & Interpretation Engine.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship

from devagent.core.database import Base

class TicketType(str, Enum):
    """Types of tickets that can be processed."""
    TASK = "Task"
    STORY = "Story"
    BUG = "Bug"
    EPIC = "Epic"

class TicketStatus(str, Enum):
    """Possible statuses for a ticket."""
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    IN_REVIEW = "In Review"
    DONE = "Done"
    BLOCKED = "Blocked"

class Ticket(Base):
    """Model representing a ticket in the system."""
    __tablename__ = "tickets"

    id = Column(String(50), primary_key=True)
    key = Column(String(50), unique=True, index=True)
    summary = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(TicketType), nullable=False)
    status = Column(SQLEnum(TicketStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requirements = relationship("Requirement", back_populates="ticket")
    comments = relationship("Comment", back_populates="ticket")

class Requirement(Base):
    """Model representing a requirement extracted from a ticket."""
    __tablename__ = "requirements"

    id = Column(String(50), primary_key=True)
    ticket_id = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLEnum(TicketStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ticket = relationship("Ticket", back_populates="requirements")

class Comment(Base):
    """Model representing a comment on a ticket."""
    __tablename__ = "comments"

    id = Column(String(50), primary_key=True)
    ticket_id = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ticket = relationship("Ticket", back_populates="comments") 