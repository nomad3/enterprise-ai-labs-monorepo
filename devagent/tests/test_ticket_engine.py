"""
Tests for the Ticket Ingestion & Interpretation Engine.
"""

from datetime import datetime
from typing import Any, Dict

import pytest

from devagent.core.ticket_engine.engine import TicketEngine
from devagent.core.ticket_engine.models import Ticket, TicketStatus, TicketType


@pytest.fixture
def sample_jira_ticket() -> Dict[str, Any]:
    """Sample Jira ticket data for testing."""
    return {
        "key": "PROJ-123",
        "fields": {
            "summary": "Implement user authentication",
            "description": """
            As a user, I want to authenticate using JWT tokens.
            
            Requirements:
            - Implement JWT token generation
            - Add token validation middleware
            - Create login endpoint
            - Add refresh token functionality
            """,
            "issuetype": {"name": "Task"},
            "status": {"name": "To Do"},
            "created": "2024-03-20T10:00:00.000+0000",
            "updated": "2024-03-20T10:00:00.000+0000",
        },
    }


@pytest.fixture
def ticket_engine():
    """Create a TicketEngine instance for testing."""
    return TicketEngine()


def test_ticket_engine_initialization(ticket_engine):
    """Test that the TicketEngine can be initialized properly."""
    assert ticket_engine is not None


def test_parse_jira_ticket(ticket_engine, sample_jira_ticket):
    """Test parsing a Jira ticket into our internal Ticket model."""
    ticket = ticket_engine.parse_ticket(sample_jira_ticket)

    assert isinstance(ticket, Ticket)
    assert ticket.key == "PROJ-123"
    assert ticket.summary == "Implement user authentication"
    assert ticket.type == TicketType.TASK
    assert ticket.status == TicketStatus.TODO
    assert isinstance(ticket.created_at, datetime)
    assert isinstance(ticket.updated_at, datetime)


def test_extract_requirements(ticket_engine, sample_jira_ticket):
    """Test extracting requirements from a ticket description."""
    requirements = ticket_engine.extract_requirements(sample_jira_ticket)

    assert len(requirements) == 4
    assert any("JWT token generation" in req.description for req in requirements)
    assert any("token validation" in req.description for req in requirements)
    assert any("login endpoint" in req.description for req in requirements)
    assert any("refresh token" in req.description for req in requirements)


def test_validate_ticket(ticket_engine, sample_jira_ticket):
    """Test ticket validation."""
    is_valid, errors = ticket_engine.validate_ticket(sample_jira_ticket)
    assert is_valid
    assert len(errors) == 0


def test_invalid_ticket(ticket_engine):
    """Test handling of invalid ticket data."""
    invalid_ticket = {
        "key": "PROJ-123",
        "fields": {
            "summary": "",  # Empty summary
            "description": "Test description",
            "issuetype": {"name": "Invalid Type"},
            "status": {"name": "Invalid Status"},
        },
    }

    is_valid, errors = ticket_engine.validate_ticket(invalid_ticket)
    assert not is_valid
    assert len(errors) > 0
    assert any("summary" in error.lower() for error in errors)
    assert any("type" in error.lower() for error in errors)
    assert any("status" in error.lower() for error in errors)
