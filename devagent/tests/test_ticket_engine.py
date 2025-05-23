"""
Tests for the Ticket Ingestion & Interpretation Engine.
"""
import pytest
from devagent.core.ticket_engine.engine import TicketEngine

def test_ticket_engine_initialization():
    """Test that the TicketEngine can be initialized properly."""
    engine = TicketEngine()
    assert engine is not None

def test_ticket_parsing():
    """Test that the engine can parse a basic Jira ticket."""
    engine = TicketEngine()
    sample_ticket = {
        "key": "PROJ-123",
        "fields": {
            "summary": "Implement user authentication",
            "description": "Add JWT-based authentication to the API",
            "issuetype": {"name": "Task"}
        }
    }
    
    parsed_ticket = engine.parse_ticket(sample_ticket)
    assert parsed_ticket["key"] == "PROJ-123"
    assert "authentication" in parsed_ticket["summary"].lower()
    assert parsed_ticket["type"] == "Task"

def test_requirement_extraction():
    """Test that the engine can extract requirements from a ticket."""
    engine = TicketEngine()
    sample_ticket = {
        "key": "PROJ-124",
        "fields": {
            "summary": "Add user profile page",
            "description": """
            As a user, I want to view and edit my profile information.
            
            Requirements:
            - Display user's name, email, and avatar
            - Allow editing of profile information
            - Add form validation
            """,
            "issuetype": {"name": "Story"}
        }
    }
    
    requirements = engine.extract_requirements(sample_ticket)
    assert len(requirements) >= 3
    assert any("display" in req.lower() for req in requirements)
    assert any("edit" in req.lower() for req in requirements)
    assert any("validation" in req.lower() for req in requirements) 