from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket

from ...core.models import (
    AgentInteraction,
    AgentResponse,
    Ticket,
    TicketFilter,
    TicketUpdate,
)
from ...core.ticket_manager import TicketManager
from ..dependencies import get_ticket_manager

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/", response_model=List[Ticket])
async def list_tickets(
    filter: Optional[TicketFilter] = None,
    skip: int = 0,
    limit: int = 100,
    ticket_manager: TicketManager = Depends(get_ticket_manager),
):
    """List tickets with optional filtering."""
    try:
        return await ticket_manager.list_tickets(filter, skip, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(
    ticket_id: str, ticket_manager: TicketManager = Depends(get_ticket_manager)
):
    """Get a specific ticket by ID."""
    try:
        ticket = await ticket_manager.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return ticket
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Ticket)
async def create_ticket(
    ticket: Ticket, ticket_manager: TicketManager = Depends(get_ticket_manager)
):
    """Create a new ticket."""
    try:
        return await ticket_manager.create_ticket(ticket)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket(
    ticket_id: str,
    update: TicketUpdate,
    ticket_manager: TicketManager = Depends(get_ticket_manager),
):
    """Update a ticket."""
    try:
        ticket = await ticket_manager.update_ticket(ticket_id, update)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return ticket
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: str, ticket_manager: TicketManager = Depends(get_ticket_manager)
):
    """Delete a ticket."""
    try:
        success = await ticket_manager.delete_ticket(ticket_id)
        if not success:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return {"message": "Ticket deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/{ticket_id}/interact")
async def interact_with_agent(
    websocket: WebSocket,
    ticket_id: str,
    ticket_manager: TicketManager = Depends(get_ticket_manager),
):
    """WebSocket endpoint for interacting with the agent about a ticket."""
    try:
        await websocket.accept()
        ticket = await ticket_manager.get_ticket(ticket_id)
        if not ticket:
            await websocket.close(code=1000, reason="Ticket not found")
            return

        while True:
            message = await websocket.receive_text()
            interaction = AgentInteraction(ticket_id=ticket_id, user_message=message)

            # Get agent response
            response = await ticket_manager.get_agent_response(ticket, message)
            interaction.response = response

            # Send response to client
            await websocket.send_json(response.dict())

            # If response requires approval, wait for it
            if response.requires_approval:
                approval = await websocket.receive_json()
                interaction.approved = approval.get("approved", False)
                if interaction.approved:
                    await ticket_manager.apply_agent_changes(ticket, response)

            # Save interaction
            await ticket_manager.add_interaction(ticket_id, interaction)

    except Exception as e:
        await websocket.close(code=1000, reason=str(e))


@router.get("/{ticket_id}/interactions", response_model=List[AgentInteraction])
async def get_ticket_interactions(
    ticket_id: str, ticket_manager: TicketManager = Depends(get_ticket_manager)
):
    """Get all interactions for a ticket."""
    try:
        ticket = await ticket_manager.get_ticket(ticket_id)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return ticket.interactions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
