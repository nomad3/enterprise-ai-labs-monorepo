"""
API endpoints for solution planning.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from devagent.core.database import get_session
from devagent.core.planning.engine import PlanningEngine, SolutionPlanner
from devagent.core.planning.models import (SolutionPlan, SolutionPlanResponse,
                                           Task, TaskResponse)
from devagent.core.ticket_engine.models import Requirement, Ticket

router = APIRouter(prefix="/plans", tags=["plans"])
planning_engine = PlanningEngine()
planner = SolutionPlanner()


@router.post("/tickets/{ticket_id}", response_model=SolutionPlanResponse)
async def create_solution_plan(
    ticket_id: str, db: AsyncSession = Depends(get_session)
) -> SolutionPlanResponse:
    """
    Create a solution plan for a ticket.

    Args:
        ticket_id: ID of the ticket to create a plan for
        db: Database session

    Returns:
        The created solution plan
    """
    # Get ticket
    ticket_stmt = select(Ticket).where(Ticket.id == ticket_id)
    ticket_result = await db.execute(ticket_stmt)
    ticket = ticket_result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    # Get requirements
    req_stmt = select(Requirement).where(Requirement.ticket_id == ticket_id)
    req_result = await db.execute(req_stmt)
    requirements = req_result.scalars().all()
    if not requirements:
        raise HTTPException(
            status_code=400, detail=f"No requirements found for ticket {ticket_id}"
        )

    try:
        # Create plan object (not yet saved)
        plan_to_save = planning_engine.create_solution_plan(ticket, requirements)

        # Save to database
        db.add(plan_to_save)
        await db.commit()

        # Fetch the saved plan with tasks eagerly loaded to ensure they are available for Pydantic
        # This is more reliable than db.refresh() for complex relationship loading for serialization
        stmt = (
            select(SolutionPlan)
            .options(selectinload(SolutionPlan.tasks))
            .where(SolutionPlan.id == plan_to_save.id)
        )
        result = await db.execute(stmt)
        created_plan = result.scalars().first()

        if not created_plan:
            # This should ideally not happen if commit was successful
            raise HTTPException(
                status_code=500, detail="Failed to retrieve created plan after saving."
            )

        return created_plan
    except Exception as e:
        # Log the exception for debugging
        # logger.error(f"Error creating solution plan: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error creating solution plan: {str(e)}"
        )


@router.get("/{plan_id}", response_model=SolutionPlanResponse)
async def get_solution_plan(
    plan_id: str, db: AsyncSession = Depends(get_session)
) -> SolutionPlanResponse:
    """
    Get a solution plan by its ID.

    Args:
        plan_id: ID of the plan to retrieve
        db: Database session

    Returns:
        The solution plan
    """
    plan_stmt = (
        select(SolutionPlan)
        .options(selectinload(SolutionPlan.tasks))
        .where(SolutionPlan.id == plan_id)
    )
    plan_result = await db.execute(plan_stmt)
    plan = plan_result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan {plan_id} not found")

    return plan


@router.get("/tickets/{ticket_id}", response_model=SolutionPlanResponse)
async def get_ticket_plan(
    ticket_id: str, db: AsyncSession = Depends(get_session)
) -> SolutionPlanResponse:
    """
    Get the solution plan for a ticket.

    Args:
        ticket_id: ID of the ticket
        db: Database session

    Returns:
        The solution plan for the ticket
    """
    plan_stmt = (
        select(SolutionPlan)
        .options(selectinload(SolutionPlan.tasks))
        .where(SolutionPlan.ticket_id == ticket_id)
    )
    plan_result = await db.execute(plan_stmt)
    plan = plan_result.scalars().first()
    if not plan:
        raise HTTPException(
            status_code=404, detail=f"No plan found for ticket {ticket_id}"
        )

    return plan


@router.get("/", response_model=List[SolutionPlanResponse])
async def list_solution_plans(
    db: AsyncSession = Depends(get_session),
) -> List[SolutionPlanResponse]:
    """
    List all solution plans.

    Args:
        db: Database session

    Returns:
        List of solution plans
    """
    plan_stmt = select(SolutionPlan).options(selectinload(SolutionPlan.tasks))
    plan_result = await db.execute(plan_stmt)
    plans = plan_result.scalars().all()

    return plans


class PlanRequest(BaseModel):
    task_description: str


class PlanResponse(BaseModel):
    plan: str


@router.post("/generate", response_model=PlanResponse)
def generate_plan(request: PlanRequest):
    try:
        plan = planner.generate_plan(request.task_description)
        return PlanResponse(plan=plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plan generation failed: {str(e)}")
