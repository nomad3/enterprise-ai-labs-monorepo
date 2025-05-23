from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TicketStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    IN_REVIEW = "In Review"
    DONE = "Done"
    BLOCKED = "Blocked"


class TicketType(str, Enum):
    TASK = "Task"
    STORY = "Story"
    BUG = "Bug"
    EPIC = "Epic"


class TicketPriority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class AgentResponse(BaseModel):
    message: str
    code_changes: Optional[List[Dict[str, Any]]] = None
    suggestions: Optional[List[str]] = None
    requires_approval: bool = False


class AgentInteraction(BaseModel):
    ticket_id: str
    user_message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response: Optional[AgentResponse] = None
    approved: Optional[bool] = None


class Ticket(BaseModel):
    id: str
    key: str
    summary: str
    description: str
    type: TicketType
    status: TicketStatus
    priority: TicketPriority
    assignee: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    interactions: List[AgentInteraction] = Field(default_factory=list)
    related_tickets: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class TicketUpdate(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TicketType] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assignee: Optional[str] = None
    related_tickets: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class TicketFilter(BaseModel):
    status: Optional[List[TicketStatus]] = None
    type: Optional[List[TicketType]] = None
    priority: Optional[List[TicketPriority]] = None
    assignee: Optional[str] = None
    tags: Optional[List[str]] = None
    search: Optional[str] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    updated_after: Optional[datetime] = None
    updated_before: Optional[datetime] = None
