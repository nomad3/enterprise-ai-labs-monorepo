"""
API endpoints for ticket management.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from devagent.core.database import get_session
from devagent.core.ticket_engine.engine import TicketEngine
from devagent.core.ticket_engine.models import Ticket, Requirement

router = APIRouter(prefix="/tickets", tags=["tickets"])
ticket_engine = TicketEngine()

@router.post("/", response_model=Dict[str, Any])
async def create_ticket(
    ticket_data: Dict[str, Any],
    db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Create a new ticket from Jira data.
    
    Args:
        ticket_data: Raw ticket data from Jira
        db: Database session
        
    Returns:
        Dict containing the created ticket and its requirements
    """
    try:
        # Process ticket
        ticket, requirements = ticket_engine.process_ticket(ticket_data)
        
        # Save to database
        db.add(ticket)
        for requirement in requirements:
            db.add(requirement)
        await db.commit()
        
        return {
            "ticket": ticket,
            "requirements": requirements,
            "message": "Ticket created successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ticket: {str(e)}")

@router.get("/{ticket_key}", response_model=Dict[str, Any])
async def get_ticket(
    ticket_key: str,
    db: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get a ticket by its key.
    
    Args:
        ticket_key: The ticket's key
        db: Database session
        
    Returns:
        Dict containing the ticket and its requirements
    """
    # Query ticket
    ticket = await db.query(Ticket).filter(Ticket.key == ticket_key).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_key} not found")
    
    # Query requirements
    requirements = await db.query(Requirement).filter(Requirement.ticket_id == ticket_key).all()
    
    return {
        "ticket": ticket,
        "requirements": requirements
    }

@router.get("/", response_model=List[Dict[str, Any]])
async def list_tickets(
    db: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    List all tickets.
    
    Args:
        db: Database session
        
    Returns:
        List of tickets with their requirements
    """
    tickets = await db.query(Ticket).all()
    result = []
    
    for ticket in tickets:
        requirements = await db.query(Requirement).filter(Requirement.ticket_id == ticket.key).all()
        result.append({
            "ticket": ticket,
            "requirements": requirements
        })
    
    return result 