"""
Ticket Ingestion & Interpretation Engine implementation.
"""
import re
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
import uuid

from devagent.core.ticket_engine.models import Ticket, TicketType, TicketStatus, Requirement

class TicketEngine:
    """Engine for processing and interpreting tickets."""

    def __init__(self):
        """Initialize the Ticket Engine."""
        self.valid_types = {t.value for t in TicketType}
        self.valid_statuses = {s.value for s in TicketStatus}

    def parse_ticket(self, ticket_data: Dict[str, Any]) -> Ticket:
        """
        Parse a Jira ticket into our internal Ticket model.
        
        Args:
            ticket_data: Raw ticket data from Jira
            
        Returns:
            Ticket: Parsed ticket object
        """
        fields = ticket_data["fields"]
        
        # Parse dates
        created_at = datetime.fromisoformat(fields["created"].replace("Z", "+00:00"))
        updated_at = datetime.fromisoformat(fields["updated"].replace("Z", "+00:00"))
        
        # Create ticket
        ticket = Ticket(
            id=str(uuid.uuid4()),
            key=ticket_data["key"],
            summary=fields["summary"],
            description=fields["description"],
            type=TicketType(fields["issuetype"]["name"]),
            status=TicketStatus(fields["status"]["name"]),
            created_at=created_at,
            updated_at=updated_at
        )
        
        return ticket

    def extract_requirements(self, ticket_data: Dict[str, Any]) -> List[Requirement]:
        """
        Extract requirements from a ticket's description.
        
        Args:
            ticket_data: Raw ticket data from Jira
            
        Returns:
            List[Requirement]: List of extracted requirements
        """
        description = ticket_data["fields"]["description"]
        requirements = []
        
        # Extract requirements from bullet points
        requirement_pattern = r"[-•]\s*(.*?)(?=\n[-•]|\n\n|$)"
        matches = re.finditer(requirement_pattern, description, re.MULTILINE)
        
        for match in matches:
            requirement = Requirement(
                id=str(uuid.uuid4()),
                ticket_id=ticket_data["key"],
                description=match.group(1).strip(),
                status=TicketStatus.TODO
            )
            requirements.append(requirement)
        
        return requirements

    def validate_ticket(self, ticket_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate a ticket's data.
        
        Args:
            ticket_data: Raw ticket data from Jira
            
        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_errors)
        """
        errors = []
        fields = ticket_data.get("fields", {})
        
        # Validate required fields
        if not fields.get("summary"):
            errors.append("Summary is required")
        
        if not fields.get("description"):
            errors.append("Description is required")
        
        # Validate type
        issue_type = fields.get("issuetype", {}).get("name")
        if not issue_type or issue_type not in self.valid_types:
            errors.append(f"Invalid issue type: {issue_type}")
        
        # Validate status
        status = fields.get("status", {}).get("name")
        if not status or status not in self.valid_statuses:
            errors.append(f"Invalid status: {status}")
        
        return len(errors) == 0, errors

    def process_ticket(self, ticket_data: Dict[str, Any]) -> Tuple[Ticket, List[Requirement]]:
        """
        Process a ticket, including validation, parsing, and requirement extraction.
        
        Args:
            ticket_data: Raw ticket data from Jira
            
        Returns:
            Tuple[Ticket, List[Requirement]]: Processed ticket and its requirements
            
        Raises:
            ValueError: If the ticket is invalid
        """
        # Validate ticket
        is_valid, errors = self.validate_ticket(ticket_data)
        if not is_valid:
            raise ValueError(f"Invalid ticket: {', '.join(errors)}")
        
        # Parse ticket
        ticket = self.parse_ticket(ticket_data)
        
        # Extract requirements
        requirements = self.extract_requirements(ticket_data)
        
        return ticket, requirements 