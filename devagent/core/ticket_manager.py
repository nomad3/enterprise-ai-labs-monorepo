import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from .agent import Agent
from .config import settings
from .models import (AgentInteraction, AgentResponse, Ticket, TicketFilter,
                     TicketUpdate)


class TicketManager:
    def __init__(self):
        self.base_path = Path(settings.WORKSPACE_ROOT) / "tickets"
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.agent = Agent()

    def _get_ticket_path(self, ticket_id: str) -> Path:
        """Get the path to a ticket's JSON file."""
        return self.base_path / f"{ticket_id}.json"

    async def list_tickets(
        self, filter: Optional[TicketFilter] = None, skip: int = 0, limit: int = 100
    ) -> List[Ticket]:
        """List tickets with optional filtering."""
        try:
            tickets = []
            for file in self.base_path.glob("*.json"):
                with open(file, "r") as f:
                    ticket_data = json.load(f)
                    ticket = Ticket(**ticket_data)

                    if filter:
                        if not self._matches_filter(ticket, filter):
                            continue

                    tickets.append(ticket)

            # Sort by updated_at descending
            tickets.sort(key=lambda x: x.updated_at, reverse=True)

            # Apply pagination
            return tickets[skip : skip + limit]
        except Exception as e:
            raise Exception(f"Error listing tickets: {str(e)}")

    async def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        """Get a specific ticket by ID."""
        try:
            ticket_path = self._get_ticket_path(ticket_id)
            if not ticket_path.exists():
                return None

            with open(ticket_path, "r") as f:
                ticket_data = json.load(f)
                return Ticket(**ticket_data)
        except Exception as e:
            raise Exception(f"Error getting ticket: {str(e)}")

    async def create_ticket(self, ticket: Ticket) -> Ticket:
        """Create a new ticket."""
        try:
            ticket_path = self._get_ticket_path(ticket.id)
            if ticket_path.exists():
                raise ValueError(f"Ticket with ID {ticket.id} already exists")

            ticket.created_at = datetime.utcnow()
            ticket.updated_at = datetime.utcnow()

            with open(ticket_path, "w") as f:
                json.dump(ticket.dict(), f, default=str)

            return ticket
        except Exception as e:
            raise Exception(f"Error creating ticket: {str(e)}")

    async def update_ticket(
        self, ticket_id: str, update: TicketUpdate
    ) -> Optional[Ticket]:
        """Update a ticket."""
        try:
            ticket = await self.get_ticket(ticket_id)
            if not ticket:
                return None

            # Update fields
            update_data = update.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(ticket, key, value)

            ticket.updated_at = datetime.utcnow()

            # Save changes
            with open(self._get_ticket_path(ticket_id), "w") as f:
                json.dump(ticket.dict(), f, default=str)

            return ticket
        except Exception as e:
            raise Exception(f"Error updating ticket: {str(e)}")

    async def delete_ticket(self, ticket_id: str) -> bool:
        """Delete a ticket."""
        try:
            ticket_path = self._get_ticket_path(ticket_id)
            if not ticket_path.exists():
                return False

            os.remove(ticket_path)
            return True
        except Exception as e:
            raise Exception(f"Error deleting ticket: {str(e)}")

    async def add_interaction(
        self, ticket_id: str, interaction: AgentInteraction
    ) -> None:
        """Add an interaction to a ticket."""
        try:
            ticket = await self.get_ticket(ticket_id)
            if not ticket:
                raise ValueError(f"Ticket {ticket_id} not found")

            ticket.interactions.append(interaction)
            ticket.updated_at = datetime.utcnow()

            with open(self._get_ticket_path(ticket_id), "w") as f:
                json.dump(ticket.dict(), f, default=str)
        except Exception as e:
            raise Exception(f"Error adding interaction: {str(e)}")

    async def get_agent_response(self, ticket: Ticket, message: str) -> AgentResponse:
        """Get a response from the agent for a ticket interaction."""
        try:
            # Get context from previous interactions
            context = self._get_interaction_context(ticket)

            # Get agent response
            response = await self.agent.get_response(message, context)
            return response
        except Exception as e:
            raise Exception(f"Error getting agent response: {str(e)}")

    async def apply_agent_changes(
        self, ticket: Ticket, response: AgentResponse
    ) -> None:
        """Apply changes suggested by the agent."""
        try:
            if not response.code_changes:
                return

            # Apply each code change
            for change in response.code_changes:
                file_path = change.get("file")
                content = change.get("content")
                if file_path and content:
                    # Use file manager to write changes
                    from .file_manager import FileManager

                    file_manager = FileManager()
                    await file_manager.write_file(file_path, content)

            # Update ticket status if needed
            if response.suggestions and any(
                "complete" in s.lower() for s in response.suggestions
            ):
                await self.update_ticket(ticket.id, TicketUpdate(status="Done"))
        except Exception as e:
            raise Exception(f"Error applying agent changes: {str(e)}")

    def _matches_filter(self, ticket: Ticket, filter: TicketFilter) -> bool:
        """Check if a ticket matches the filter criteria."""
        if filter.status and ticket.status not in filter.status:
            return False
        if filter.type and ticket.type not in filter.type:
            return False
        if filter.priority and ticket.priority not in filter.priority:
            return False
        if filter.assignee and ticket.assignee != filter.assignee:
            return False
        if filter.tags and not all(tag in ticket.tags for tag in filter.tags):
            return False
        if filter.search:
            search_terms = filter.search.lower().split()
            ticket_text = f"{ticket.summary} {ticket.description}".lower()
            if not all(term in ticket_text for term in search_terms):
                return False
        if filter.created_after and ticket.created_at < filter.created_after:
            return False
        if filter.created_before and ticket.created_at > filter.created_before:
            return False
        if filter.updated_after and ticket.updated_at < filter.updated_after:
            return False
        if filter.updated_before and ticket.updated_at > filter.updated_before:
            return False
        return True

    def _get_interaction_context(self, ticket: Ticket) -> Dict[str, Any]:
        """Get context from previous interactions for the agent."""
        context = {
            "ticket": {
                "id": ticket.id,
                "summary": ticket.summary,
                "description": ticket.description,
                "type": ticket.type,
                "status": ticket.status,
                "priority": ticket.priority,
            },
            "interactions": [],
        }

        # Add recent interactions
        for interaction in ticket.interactions[-5:]:  # Last 5 interactions
            context["interactions"].append(
                {
                    "message": interaction.user_message,
                    "response": (
                        interaction.response.dict() if interaction.response else None
                    ),
                    "approved": interaction.approved,
                }
            )

        return context
