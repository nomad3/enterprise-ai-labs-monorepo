"""
Tests for the Solution Planning & Strategy Module.
"""

from datetime import datetime
from typing import Any, Dict, List

import pytest

from agentprovision.core.planning.engine import PlanningEngine
from agentprovision.core.planning.models import (SolutionPlan, Task,
                                                 TaskPriority, TaskStatus)
from agentprovision.core.ticket_engine.models import (Requirement, Ticket,
                                                      TicketStatus, TicketType)


@pytest.fixture
def sample_ticket() -> Ticket:
    """Create a sample ticket for testing."""
    return Ticket(
        id="test-123",
        key="TEST-123",
        summary="Implement user authentication",
        description="Add JWT-based authentication to the API",
        type=TicketType.TASK,
        status=TicketStatus.TODO,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_requirements() -> List[Requirement]:
    """Create sample requirements for testing."""
    return [
        Requirement(
            id="req-1",
            ticket_id="TEST-123",
            description="Implement JWT token generation",
            status=TicketStatus.TODO,
        ),
        Requirement(
            id="req-2",
            ticket_id="TEST-123",
            description="Add token validation middleware",
            status=TicketStatus.TODO,
        ),
        Requirement(
            id="req-3",
            ticket_id="TEST-123",
            description="Create login endpoint",
            status=TicketStatus.TODO,
        ),
    ]


@pytest.fixture
def planning_engine():
    """Create a PlanningEngine instance for testing."""
    return PlanningEngine()


def test_planning_engine_initialization(planning_engine):
    """Test that the PlanningEngine can be initialized properly."""
    assert planning_engine is not None


def test_create_solution_plan(planning_engine, sample_ticket, sample_requirements):
    """Test creating a solution plan from a ticket and its requirements."""
    plan = planning_engine.create_solution_plan(sample_ticket, sample_requirements)

    assert isinstance(plan, SolutionPlan)
    assert plan.ticket_id == sample_ticket.id
    assert len(plan.tasks) > 0
    assert all(isinstance(task, Task) for task in plan.tasks)


def test_task_prioritization(planning_engine, sample_ticket, sample_requirements):
    """Test that tasks are properly prioritized."""
    plan = planning_engine.create_solution_plan(sample_ticket, sample_requirements)

    # Check that tasks have priorities
    assert all(task.priority in TaskPriority for task in plan.tasks)
    # Check that at least one task is not LOW priority
    assert any(task.priority != TaskPriority.LOW for task in plan.tasks)


def test_task_dependencies(planning_engine, sample_ticket, sample_requirements):
    """Test that task dependencies are properly established."""
    plan = planning_engine.create_solution_plan(sample_ticket, sample_requirements)

    # Check that tasks have dependencies (if any dependencies exist)
    assert any(
        task.dependencies is not None and len(task.dependencies) > 0
        for task in plan.tasks
    )

    # Check for circular dependencies
    for task in plan.tasks:
        visited = set()
        current = task
        while current and current.dependencies:
            dep_ids = current.dependencies.split(",")
            dep_id = dep_ids[0] if dep_ids else None
            if dep_id in visited:
                pytest.fail(f"Circular dependency detected for task {current.id}")
            visited.add(current.id)
            current = next((t for t in plan.tasks if t.id == dep_id), None)


def test_estimate_task_effort(planning_engine, sample_ticket, sample_requirements):
    """Test task effort estimation."""
    plan = planning_engine.create_solution_plan(sample_ticket, sample_requirements)

    for task in plan.tasks:
        effort = planning_engine.estimate_task_effort(task)
        assert isinstance(effort, int)
        assert effort > 0


def test_validate_solution_plan(planning_engine, sample_ticket, sample_requirements):
    """Test solution plan validation."""
    plan = planning_engine.create_solution_plan(sample_ticket, sample_requirements)

    is_valid, errors = planning_engine.validate_solution_plan(plan)
    assert is_valid
    assert len(errors) == 0


def test_invalid_solution_plan(planning_engine):
    """Test handling of invalid solution plans."""
    # Create an invalid plan with missing required fields
    invalid_plan = SolutionPlan(
        id="plan-1", ticket_id="invalid-ticket", tasks=[], created_at=datetime.utcnow()
    )

    is_valid, errors = planning_engine.validate_solution_plan(invalid_plan)
    assert not is_valid
    assert len(errors) > 0
