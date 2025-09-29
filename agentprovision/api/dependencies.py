from fastapi import Depends

from ..core.file_manager import FileManager
from ..core.ticket_manager import TicketManager


def get_file_manager() -> FileManager:
    """Get a FileManager instance."""
    return FileManager()


def get_ticket_manager() -> TicketManager:
    """Get a TicketManager instance."""
    return TicketManager()
