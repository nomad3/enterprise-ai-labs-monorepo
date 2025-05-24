"""
API endpoints for solution planning.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from devagent.core.database import get_session
from devagent.core.planning.engine import PlanningEngine, SolutionPlanner
from devagent.core.planning.models import SolutionPlan, Task
from devagent.core.ticket_engine.models import Requirement, Ticket

router = APIRouter(prefix="/plans", tags=["plans"])
planning_engine = PlanningEngine()
planner = SolutionPlanner()


@router.post("/tickets/{ticket_id}", response_model=Dict[str, Any])
async def create_solution_plan(
    ticket_id: str, db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Create a solution plan for a ticket.

    Args:
        ticket_id: ID of the ticket to create a plan for
        db: Database session

    Returns:
        Dict containing the created plan and its tasks
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
        # Create plan
        plan = planning_engine.create_solution_plan(ticket, requirements)

        # Save to database
        db.add(plan)
        await db.commit()

        return {
            "plan": plan,
            "tasks": plan.tasks,
            "message": "Solution plan created successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating solution plan: {str(e)}"
        )


@router.get("/{plan_id}", response_model=Dict[str, Any])
async def get_solution_plan(
    plan_id: str, db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get a solution plan by its ID.

    Args:
        plan_id: ID of the plan to retrieve
        db: Database session

    Returns:
        Dict containing the plan and its tasks
    """
    # Query plan
    plan_stmt = select(SolutionPlan).where(SolutionPlan.id == plan_id)
    plan_result = await db.execute(plan_stmt)
    plan = plan_result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan {plan_id} not found")

    # Query tasks
    task_stmt = select(Task).where(Task.plan_id == plan_id)
    task_result = await db.execute(task_stmt)
    tasks = task_result.scalars().all()

    return {"plan": plan, "tasks": tasks}


@router.get("/tickets/{ticket_id}", response_model=Dict[str, Any])
async def get_ticket_plan(
    ticket_id: str, db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get the solution plan for a ticket.

    Args:
        ticket_id: ID of the ticket
        db: Database session

    Returns:
        Dict containing the plan and its tasks
    """
    # Query plan
    plan_stmt = select(SolutionPlan).where(SolutionPlan.ticket_id == ticket_id)
    plan_result = await db.execute(plan_stmt)
    plan = plan_result.scalars().first()
    if not plan:
        raise HTTPException(
            status_code=404, detail=f"No plan found for ticket {ticket_id}"
        )

    # Query tasks
    task_stmt = select(Task).where(Task.plan_id == plan.id)
    task_result = await db.execute(task_stmt)
    tasks = task_result.scalars().all()

    return {"plan": plan, "tasks": tasks}


@router.get("/", response_model=List[Dict[str, Any]])
async def list_solution_plans(
    db: AsyncSession = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    List all solution plans.

    Args:
        db: Database session

    Returns:
        List of plans with their tasks
    """
    plan_stmt = select(SolutionPlan)
    plan_result = await db.execute(plan_stmt)
    plans = plan_result.scalars().all()
    
    response_list = []
    for plan_item in plans:
        task_stmt = select(Task).where(Task.plan_id == plan_item.id)
        task_result = await db.execute(task_stmt)
        tasks = task_result.scalars().all()
        response_list.append({"plan": plan_item, "tasks": tasks})

    return response_list


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
