"""
Chat Service for agentprovision.

This service provides conversational interfaces for interacting with agents,
enabling natural language communication, task management, and tool execution.
"""

import asyncio
import json
import logging
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from agentprovision.core.interfaces.agent_interface import (Task, TaskResult,
                                                            TaskStatus)
from agentprovision.core.services.agent_runtime import (AgentRuntime,
                                                        get_agent_runtime)
from agentprovision.core.services.llm_engine import (LLMEngine, LLMRequest,
                                                     get_llm_engine)
from agentprovision.core.tools.tool_framework import (AgentSkill, BaseTool,
                                                      ToolDefinition,
                                                      ToolResult,
                                                      get_skill_registry,
                                                      get_tool_registry)

logger = logging.getLogger(__name__)


class MessageType(str, Enum):
    """Types of chat messages."""

    USER = "user"
    AGENT = "agent"
    SYSTEM = "system"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    TASK_UPDATE = "task_update"


class MessageStatus(str, Enum):
    """Status of chat messages."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ChatMessage(BaseModel):
    """Represents a message in a chat conversation."""

    id: UUID = Field(default_factory=uuid4)
    conversation_id: UUID
    message_type: MessageType
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    status: MessageStatus = MessageStatus.PENDING
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Agent-specific fields
    agent_id: Optional[str] = None
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    tool_results: List[ToolResult] = Field(default_factory=list)

    # Task-related fields
    task_id: Optional[UUID] = None
    task_result: Optional[TaskResult] = None


class Conversation(BaseModel):
    """Represents a conversation with an agent."""

    id: UUID = Field(default_factory=uuid4)
    tenant_id: int
    user_id: str
    agent_id: str
    title: str = "New Conversation"
    messages: List[ChatMessage] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentCapabilities(BaseModel):
    """Represents an agent's capabilities for chat interactions."""

    agent_id: str
    agent_type: str
    skills: List[AgentSkill] = Field(default_factory=list)
    tools: List[ToolDefinition] = Field(default_factory=list)
    supported_languages: List[str] = Field(
        default_factory=lambda: ["python", "javascript", "bash"]
    )
    can_execute_code: bool = True
    can_access_files: bool = True
    can_browse_web: bool = True
    max_conversation_length: int = 100
    response_style: str = "helpful_and_detailed"


class ChatService:
    """
    Service for managing conversational interactions with agents.
    """

    def __init__(self):
        self.conversations: Dict[UUID, Conversation] = {}
        self.agent_capabilities: Dict[str, AgentCapabilities] = {}
        self.llm_engine: Optional[LLMEngine] = None
        self.agent_runtime: Optional[AgentRuntime] = None
        self.tool_registry = get_tool_registry()
        self.skill_registry = get_skill_registry()
        self._service_running = False

    async def start_service(self):
        """Start the chat service."""
        self._service_running = True
        logger.info("Chat Service started")

        # Get dependencies
        self.llm_engine = await get_llm_engine()
        self.agent_runtime = await get_agent_runtime()

        # Initialize agent capabilities
        await self._initialize_agent_capabilities()

    async def stop_service(self):
        """Stop the chat service."""
        self._service_running = False
        logger.info("Chat Service stopped")

    async def create_conversation(
        self, tenant_id: int, user_id: str, agent_id: str, title: str = None
    ) -> UUID:
        """Create a new conversation with an agent."""
        # Verify agent exists
        agent_status = await self.agent_runtime.get_agent_status(agent_id)
        if not agent_status:
            raise ValueError(f"Agent {agent_id} not found")

        conversation = Conversation(
            tenant_id=tenant_id,
            user_id=user_id,
            agent_id=agent_id,
            title=title
            or f"Chat with {agent_status.get('config', {}).get('name', agent_id)}",
        )

        self.conversations[conversation.id] = conversation

        # Add welcome message
        welcome_msg = await self._generate_welcome_message(conversation)
        conversation.messages.append(welcome_msg)

        logger.info(
            f"Created conversation {conversation.id} for user {user_id} with agent {agent_id}"
        )
        return conversation.id

    async def send_message(
        self, conversation_id: UUID, content: str, user_id: str
    ) -> ChatMessage:
        """Send a message to an agent in a conversation."""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} not found")

        if conversation.user_id != user_id:
            raise ValueError("Access denied to conversation")

        # Create user message
        user_message = ChatMessage(
            conversation_id=conversation_id,
            message_type=MessageType.USER,
            content=content,
            status=MessageStatus.COMPLETED,
        )

        conversation.messages.append(user_message)
        conversation.updated_at = datetime.utcnow()

        # Process message and generate agent response
        agent_response = await self._process_user_message(conversation, user_message)
        conversation.messages.append(agent_response)

        return agent_response

    async def get_conversation(
        self, conversation_id: UUID, user_id: str
    ) -> Optional[Conversation]:
        """Get a conversation by ID."""
        conversation = self.conversations.get(conversation_id)

        if conversation and conversation.user_id == user_id:
            return conversation

        return None

    async def list_conversations(
        self, user_id: str, tenant_id: int
    ) -> List[Conversation]:
        """List conversations for a user."""
        return [
            conv
            for conv in self.conversations.values()
            if conv.user_id == user_id and conv.tenant_id == tenant_id
        ]

    async def get_agent_capabilities(
        self, agent_id: str
    ) -> Optional[AgentCapabilities]:
        """Get capabilities for an agent."""
        return self.agent_capabilities.get(agent_id)

    async def execute_tool(
        self,
        conversation_id: UUID,
        tool_name: str,
        parameters: Dict[str, Any],
        user_id: str,
    ) -> ToolResult:
        """Execute a tool in the context of a conversation."""
        conversation = self.conversations.get(conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise ValueError("Invalid conversation or access denied")

        tool = self.tool_registry.get_tool(tool_name)
        if not tool:
            raise ValueError(f"Tool {tool_name} not found")

        # Create tool call message
        tool_call_msg = ChatMessage(
            conversation_id=conversation_id,
            message_type=MessageType.TOOL_CALL,
            content=f"Executing {tool_name} with parameters: {json.dumps(parameters, indent=2)}",
            metadata={"tool_name": tool_name, "parameters": parameters},
            status=MessageStatus.PROCESSING,
        )

        conversation.messages.append(tool_call_msg)

        try:
            # Execute tool
            result = await tool.execute(
                parameters, {"conversation_id": conversation_id}
            )

            # Create tool result message
            tool_result_msg = ChatMessage(
                conversation_id=conversation_id,
                message_type=MessageType.TOOL_RESULT,
                content=f"Tool {tool_name} executed {'successfully' if result.success else 'with errors'}",
                metadata={"tool_result": result.dict()},
                status=MessageStatus.COMPLETED,
                tool_results=[result],
            )

            conversation.messages.append(tool_result_msg)
            tool_call_msg.status = MessageStatus.COMPLETED

            return result

        except Exception as e:
            tool_call_msg.status = MessageStatus.FAILED
            tool_call_msg.metadata["error"] = str(e)

            error_result = ToolResult(
                tool_name=tool_name, success=False, error_message=str(e)
            )

            return error_result

    async def _initialize_agent_capabilities(self):
        """Initialize capabilities for all available agents."""
        # Get all agents from runtime
        agents = await self.agent_runtime.list_agents()

        for agent_data in agents:
            agent_id = agent_data["id"]
            agent_type = agent_data["config"]["agent_type"]

            # Get skills for this agent type
            skills = self._get_skills_for_agent_type(agent_type)

            # Get tools for these skills
            tools = []
            for skill in skills:
                for tool_name in skill.tools:
                    tool = self.tool_registry.get_tool(tool_name)
                    if tool:
                        tools.append(tool.get_definition())

            capabilities = AgentCapabilities(
                agent_id=agent_id, agent_type=agent_type, skills=skills, tools=tools
            )

            self.agent_capabilities[agent_id] = capabilities

    def _get_skills_for_agent_type(self, agent_type: str) -> List[AgentSkill]:
        """Get skills appropriate for an agent type."""
        all_skills = self.skill_registry.list_skills()

        # Map agent types to relevant skills
        skill_mapping = {
            "full_stack": [
                "file_management",
                "code_development",
                "web_research",
                "data_analysis",
            ],
            "devops": ["file_management", "system_administration", "code_development"],
            "qa": ["code_development", "file_management", "web_research"],
            "data_analysis": ["data_analysis", "code_development", "file_management"],
            "security": [
                "system_administration",
                "code_development",
                "file_management",
            ],
        }

        relevant_skill_names = skill_mapping.get(
            agent_type, ["file_management", "code_development"]
        )

        return [skill for skill in all_skills if skill.name in relevant_skill_names]

    async def _generate_welcome_message(
        self, conversation: Conversation
    ) -> ChatMessage:
        """Generate a welcome message for a new conversation."""
        agent_capabilities = self.agent_capabilities.get(conversation.agent_id)

        if agent_capabilities:
            skills_list = ", ".join(
                [
                    skill.name.replace("_", " ").title()
                    for skill in agent_capabilities.skills
                ]
            )
            tools_list = ", ".join(
                [
                    tool.name.replace("_", " ").title()
                    for tool in agent_capabilities.tools
                ]
            )

            welcome_content = f"""Hello! I'm your {agent_capabilities.agent_type.replace("_", " ").title()} agent.

**My Skills:**
{skills_list}

**Available Tools:**
{tools_list}

I can help you with various tasks including:
- Writing and reviewing code
- Managing files and directories
- Executing code in multiple languages
- Browsing the web for information
- Analyzing data and generating insights

Just tell me what you'd like to work on, and I'll assist you step by step!"""
        else:
            welcome_content = "Hello! I'm ready to help you with your tasks. What would you like to work on today?"

        return ChatMessage(
            conversation_id=conversation.id,
            message_type=MessageType.AGENT,
            content=welcome_content,
            agent_id=conversation.agent_id,
            status=MessageStatus.COMPLETED,
        )

    async def _process_user_message(
        self, conversation: Conversation, user_message: ChatMessage
    ) -> ChatMessage:
        """Process a user message and generate an agent response."""
        try:
            # Analyze user intent
            intent_analysis = await self._analyze_user_intent(
                conversation, user_message.content
            )

            # Generate response based on intent
            if intent_analysis.get("requires_tool_execution"):
                return await self._handle_tool_execution_request(
                    conversation, user_message, intent_analysis
                )
            elif intent_analysis.get("requires_task_creation"):
                return await self._handle_task_creation_request(
                    conversation, user_message, intent_analysis
                )
            else:
                return await self._generate_conversational_response(
                    conversation, user_message, intent_analysis
                )

        except Exception as e:
            logger.error(f"Error processing user message: {e}")
            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=f"I encountered an error while processing your message: {str(e)}. Please try again or rephrase your request.",
                agent_id=conversation.agent_id,
                status=MessageStatus.FAILED,
                metadata={"error": str(e)},
            )

    async def _analyze_user_intent(
        self, conversation: Conversation, content: str
    ) -> Dict[str, Any]:
        """Analyze user intent using LLM."""
        agent_capabilities = self.agent_capabilities.get(conversation.agent_id)

        system_prompt = f"""You are an intent analysis system for an AI agent assistant. Analyze the user's message and determine their intent.

Agent Capabilities:
- Skills: {', '.join([s.name for s in agent_capabilities.skills]) if agent_capabilities else 'general'}
- Tools: {', '.join([t.name for t in agent_capabilities.tools]) if agent_capabilities else 'basic'}

Classify the intent and provide a JSON response with:
{{
    "intent_type": "conversational|tool_execution|task_creation|information_request",
    "requires_tool_execution": boolean,
    "requires_task_creation": boolean,
    "suggested_tools": ["tool1", "tool2"],
    "suggested_task_type": "task_type",
    "parameters": {{"key": "value"}},
    "confidence": 0.0-1.0,
    "reasoning": "explanation"
}}

Intent Types:
- conversational: General chat, questions, explanations
- tool_execution: Direct tool usage (read file, execute code, etc.)
- task_creation: Complex tasks requiring agent execution
- information_request: Asking for information about capabilities, status, etc.
"""

        llm_request = LLMRequest(
            tenant_id=conversation.tenant_id,
            prompt=f"User message: {content}",
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=500,
        )

        try:
            response = await self.llm_engine.generate(llm_request)
            intent_data = json.loads(response.content)
            return intent_data
        except Exception as e:
            logger.error(f"Error analyzing intent: {e}")
            return {
                "intent_type": "conversational",
                "requires_tool_execution": False,
                "requires_task_creation": False,
                "confidence": 0.5,
                "reasoning": "Fallback due to analysis error",
            }

    async def _handle_tool_execution_request(
        self,
        conversation: Conversation,
        user_message: ChatMessage,
        intent_analysis: Dict[str, Any],
    ) -> ChatMessage:
        """Handle requests that require tool execution."""
        suggested_tools = intent_analysis.get("suggested_tools", [])
        parameters = intent_analysis.get("parameters", {})

        if not suggested_tools:
            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content="I understand you want me to use a tool, but I'm not sure which one. Could you be more specific about what you'd like me to do?",
                agent_id=conversation.agent_id,
                status=MessageStatus.COMPLETED,
            )

        # Execute the first suggested tool
        tool_name = suggested_tools[0]
        tool = self.tool_registry.get_tool(tool_name)

        if not tool:
            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=f"I don't have access to the {tool_name} tool. Here are the tools I can use: {', '.join([t.name for t in self.agent_capabilities.get(conversation.agent_id, AgentCapabilities(agent_id='', agent_type='')).tools])}",
                agent_id=conversation.agent_id,
                status=MessageStatus.COMPLETED,
            )

        try:
            # Execute tool
            result = await tool.execute(parameters)

            # Generate response based on result
            if result.success:
                response_content = f"I've successfully executed the {tool_name} tool. Here's what I found:\n\n"
                if isinstance(result.output, dict):
                    for key, value in result.output.items():
                        response_content += (
                            f"**{key.replace('_', ' ').title()}:** {value}\n"
                        )
                else:
                    response_content += str(result.output)
            else:
                response_content = f"I encountered an error while executing the {tool_name} tool: {result.error_message}"

            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=response_content,
                agent_id=conversation.agent_id,
                status=MessageStatus.COMPLETED,
                tool_results=[result],
                metadata={"executed_tool": tool_name, "parameters": parameters},
            )

        except Exception as e:
            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=f"I encountered an error while trying to execute the {tool_name} tool: {str(e)}",
                agent_id=conversation.agent_id,
                status=MessageStatus.FAILED,
                metadata={"error": str(e), "attempted_tool": tool_name},
            )

    async def _handle_task_creation_request(
        self,
        conversation: Conversation,
        user_message: ChatMessage,
        intent_analysis: Dict[str, Any],
    ) -> ChatMessage:
        """Handle requests that require creating and executing a task."""
        task_type = intent_analysis.get("suggested_task_type", "generic")
        parameters = intent_analysis.get("parameters", {})

        # Create task
        task = Task(
            agent_id=conversation.agent_id,
            tenant_id=conversation.tenant_id,
            task_type=task_type,
            input_data={"user_request": user_message.content, **parameters},
            context={"conversation_id": str(conversation.id)},
        )

        try:
            # Execute task through agent runtime
            result = await self.agent_runtime.execute_task(conversation.agent_id, task)

            # Generate response based on result
            if result.status == TaskStatus.COMPLETED:
                response_content = f"I've completed your {task_type.replace('_', ' ')} task. Here's what I accomplished:\n\n"
                if result.output_data:
                    for key, value in result.output_data.items():
                        if key != "user_request":
                            response_content += (
                                f"**{key.replace('_', ' ').title()}:**\n{value}\n\n"
                            )
            else:
                response_content = f"I encountered an issue while working on your {task_type.replace('_', ' ')} task: {result.error_message}"

            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=response_content,
                agent_id=conversation.agent_id,
                status=MessageStatus.COMPLETED,
                task_id=task.id,
                task_result=result,
                metadata={
                    "task_type": task_type,
                    "execution_time_ms": result.execution_time_ms,
                },
            )

        except Exception as e:
            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=f"I encountered an error while trying to execute your task: {str(e)}",
                agent_id=conversation.agent_id,
                status=MessageStatus.FAILED,
                metadata={"error": str(e), "attempted_task_type": task_type},
            )

    async def _generate_conversational_response(
        self,
        conversation: Conversation,
        user_message: ChatMessage,
        intent_analysis: Dict[str, Any],
    ) -> ChatMessage:
        """Generate a conversational response using LLM."""
        agent_capabilities = self.agent_capabilities.get(conversation.agent_id)

        # Build conversation context
        # Last 10 messages for context
        recent_messages = conversation.messages[-10:]
        context_messages = []

        for msg in recent_messages:
            if msg.message_type == MessageType.USER:
                context_messages.append(f"User: {msg.content}")
            elif msg.message_type == MessageType.AGENT:
                context_messages.append(f"Agent: {msg.content}")

        conversation_context = "\n".join(context_messages)

        system_prompt = f"""You are a helpful AI agent assistant with the following capabilities:

Agent Type: {agent_capabilities.agent_type if agent_capabilities else 'general'}
Skills: {', '.join([s.name.replace('_', ' ').title() for s in agent_capabilities.skills]) if agent_capabilities else 'general assistance'}
Available Tools: {', '.join([t.name.replace('_', ' ').title() for t in agent_capabilities.tools]) if agent_capabilities else 'basic tools'}

You can:
- Answer questions and provide explanations
- Help with coding and development tasks
- Execute code and manage files
- Browse the web for information
- Analyze data and generate insights

Be helpful, informative, and suggest specific actions when appropriate. If the user's request could benefit from using one of your tools or creating a task, mention that option.

Conversation Context:
{conversation_context}
"""

        llm_request = LLMRequest(
            tenant_id=conversation.tenant_id,
            prompt=user_message.content,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=1000,
        )

        try:
            response = await self.llm_engine.generate(llm_request)

            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content=response.content,
                agent_id=conversation.agent_id,
                status=MessageStatus.COMPLETED,
                metadata={
                    "model_used": response.model_used,
                    "cost": response.cost,
                    "intent_analysis": intent_analysis,
                },
            )

        except Exception as e:
            return ChatMessage(
                conversation_id=conversation.id,
                message_type=MessageType.AGENT,
                content="I'm having trouble generating a response right now. Please try again in a moment.",
                agent_id=conversation.agent_id,
                status=MessageStatus.FAILED,
                metadata={"error": str(e)},
            )


# Global chat service instance
chat_service = ChatService()


async def get_chat_service() -> ChatService:
    """Get the global chat service instance."""
    return chat_service
