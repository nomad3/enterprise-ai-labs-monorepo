"""
API routes for Chat Service.
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from agentprovision.api.auth import get_current_user_dependency
from agentprovision.core.models.user_model import User
from agentprovision.core.services.chat_service import (AgentCapabilities,
                                                       ChatMessage,
                                                       ChatService,
                                                       Conversation,
                                                       get_chat_service)
from agentprovision.core.tools.tool_framework import ToolResult

router = APIRouter(prefix="/chat", tags=["Chat Interface"])


class CreateConversationRequest(BaseModel):
    """Request model for creating a conversation."""

    agent_id: str
    title: Optional[str] = None


class SendMessageRequest(BaseModel):
    """Request model for sending a message."""

    content: str


class ExecuteToolRequest(BaseModel):
    """Request model for executing a tool."""

    tool_name: str
    parameters: Dict


@router.post("/conversations", response_model=Dict[str, str])
async def create_conversation(
    request: CreateConversationRequest,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Create a new conversation with an agent."""
    try:
        if not current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must be associated with a tenant",
            )

        conversation_id = await chat_service.create_conversation(
            tenant_id=current_user.tenant_id,
            user_id=str(current_user.id),
            agent_id=request.agent_id,
            title=request.title,
        )

        return {
            "conversation_id": str(conversation_id),
            "message": "Conversation created successfully",
        }

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}",
        )


@router.get("/conversations", response_model=List[Conversation])
async def list_conversations(
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """List all conversations for the current user."""
    try:
        if not current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User must be associated with a tenant",
            )

        conversations = await chat_service.list_conversations(
            user_id=str(current_user.id), tenant_id=current_user.tenant_id
        )

        return conversations

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list conversations: {str(e)}",
        )


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Get a specific conversation."""
    try:
        conversation = await chat_service.get_conversation(
            conversation_id=conversation_id, user_id=str(current_user.id)
        )

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        return conversation

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation: {str(e)}",
        )


@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessage)
async def send_message(
    conversation_id: UUID,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Send a message to an agent in a conversation."""
    try:
        response = await chat_service.send_message(
            conversation_id=conversation_id,
            content=request.content,
            user_id=str(current_user.id),
        )

        return response

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )


@router.post("/conversations/{conversation_id}/tools", response_model=ToolResult)
async def execute_tool(
    conversation_id: UUID,
    request: ExecuteToolRequest,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Execute a tool in the context of a conversation."""
    try:
        result = await chat_service.execute_tool(
            conversation_id=conversation_id,
            tool_name=request.tool_name,
            parameters=request.parameters,
            user_id=str(current_user.id),
        )

        return result

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute tool: {str(e)}",
        )


@router.get(
    "/agents/{agent_id}/capabilities", response_model=Optional[AgentCapabilities]
)
async def get_agent_capabilities(
    agent_id: str,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Get capabilities for a specific agent."""
    try:
        capabilities = await chat_service.get_agent_capabilities(agent_id)

        if not capabilities:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent capabilities not found",
            )

        return capabilities

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent capabilities: {str(e)}",
        )


@router.get("/tools", response_model=List[Dict])
async def list_available_tools(
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """List all available tools."""
    try:
        tools = chat_service.tool_registry.list_tools()
        return [tool.dict() for tool in tools]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list tools: {str(e)}",
        )


@router.get("/skills", response_model=List[Dict])
async def list_available_skills(
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """List all available skills."""
    try:
        skills = chat_service.skill_registry.list_skills()
        return [skill.dict() for skill in skills]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list skills: {str(e)}",
        )


@router.get(
    "/conversations/{conversation_id}/messages", response_model=List[ChatMessage]
)
async def get_conversation_messages(
    conversation_id: UUID,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Get messages from a conversation with pagination."""
    try:
        conversation = await chat_service.get_conversation(
            conversation_id=conversation_id, user_id=str(current_user.id)
        )

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Apply pagination
        messages = conversation.messages[offset : offset + limit]
        return messages

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}",
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user_dependency),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Delete a conversation."""
    try:
        conversation = await chat_service.get_conversation(
            conversation_id=conversation_id, user_id=str(current_user.id)
        )

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Mark conversation as inactive
        conversation.is_active = False

        return {"message": "Conversation deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}",
        )
