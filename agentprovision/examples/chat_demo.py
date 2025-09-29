"""
Demo script showing how to use the agentprovision chat interface with skills and tools.

This script demonstrates:
- Creating conversations with agents
- Sending messages and getting responses
- Using tools through the chat interface
- Executing tasks with natural language
"""

import asyncio
import json
from uuid import UUID

import httpx


class AgentProvisionChatDemo:
    """Demo client for agentprovision chat interface."""

    def __init__(self, base_url: str = "http://localhost:8001", api_key: str = None):
        self.base_url = base_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"} if api_key else {},
        )

    async def demo_chat_workflow(self):
        """Demonstrate a complete chat workflow."""
        print("🚀 Starting agentprovision Chat Demo")
        print("=" * 50)

        try:
            # 1. List available agents
            print("\n1. 📋 Listing available agents...")
            agents = await self.list_agents()
            print(f"Found {len(agents)} agents:")
            for agent in agents[:3]:  # Show first 3
                print(
                    f"  - {agent['config']['name']} ({agent['config']['agent_type']})"
                )

            if not agents:
                print("No agents available. Please create an agent first.")
                return

            # 2. Get agent capabilities
            agent_id = agents[0]["id"]
            print(f"\n2. 🔍 Getting capabilities for agent {agent_id}...")
            capabilities = await self.get_agent_capabilities(agent_id)
            if capabilities:
                print(f"Agent Type: {capabilities['agent_type']}")
                print(
                    f"Skills: {', '.join([s['name'] for s in capabilities['skills']])}"
                )
                print(f"Tools: {', '.join([t['name'] for t in capabilities['tools']])}")

            # 3. Create conversation
            print(f"\n3. 💬 Creating conversation with agent...")
            conversation_id = await self.create_conversation(
                agent_id, "Demo Chat Session"
            )
            print(f"Created conversation: {conversation_id}")

            # 4. Send initial message
            print(f"\n4. 📝 Sending initial message...")
            response = await self.send_message(
                conversation_id,
                "Hello! Can you help me create a simple Python function to calculate fibonacci numbers?",
            )
            print(f"Agent Response: {response['content'][:200]}...")

            # 5. Request code generation
            print(f"\n5. 🔧 Requesting code generation...")
            response = await self.send_message(
                conversation_id,
                "Please write a Python function that calculates the nth Fibonacci number using recursion with memoization for efficiency.",
            )
            print(f"Agent Response: {response['content'][:300]}...")

            # 6. Use file system tool
            print(f"\n6. 📁 Using file system tool to save code...")
            tool_result = await self.execute_tool(
                conversation_id,
                "file_system",
                {
                    "operation": "write",
                    "path": "/tmp/fibonacci.py",
                    "content": "def fibonacci(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 2:\n        return 1\n    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)\n    return memo[n]\n\nprint(f'Fibonacci(10) = {fibonacci(10)}')",
                },
            )
            print(
                f"File operation result: {'Success' if tool_result['success'] else 'Failed'}"
            )

            # 7. Execute the code
            print(f"\n7. ⚡ Executing the Python code...")
            tool_result = await self.execute_tool(
                conversation_id,
                "code_execution",
                {
                    "language": "python",
                    "code": "exec(open('/tmp/fibonacci.py').read())",
                },
            )
            if tool_result["success"]:
                print(f"Code output: {tool_result['output']['stdout']}")
            else:
                print(f"Execution failed: {tool_result['error_message']}")

            # 8. Ask for code review
            print(f"\n8. 🔍 Requesting code review...")
            response = await self.send_message(
                conversation_id,
                "Can you review the fibonacci code I just created and suggest any improvements?",
            )
            print(f"Code Review: {response['content'][:400]}...")

            # 9. Get conversation history
            print(f"\n9. 📚 Getting conversation history...")
            messages = await self.get_conversation_messages(conversation_id)
            print(f"Total messages in conversation: {len(messages)}")

            # 10. List available tools and skills
            print(f"\n10. 🛠️ Available tools and skills...")
            tools = await self.list_tools()
            skills = await self.list_skills()
            print(f"Available tools: {', '.join([t['name'] for t in tools])}")
            print(f"Available skills: {', '.join([s['name'] for s in skills])}")

            print("\n✅ Demo completed successfully!")

        except Exception as e:
            print(f"❌ Demo failed: {e}")

        finally:
            await self.client.aclose()

    async def list_agents(self):
        """List available agents."""
        response = await self.client.get("/api/v1/runtime/agents")
        response.raise_for_status()
        return response.json()["agents"]

    async def get_agent_capabilities(self, agent_id: str):
        """Get agent capabilities."""
        response = await self.client.get(f"/api/v1/chat/agents/{agent_id}/capabilities")
        if response.status_code == 200:
            return response.json()
        return None

    async def create_conversation(self, agent_id: str, title: str = None) -> str:
        """Create a new conversation."""
        response = await self.client.post(
            "/api/v1/chat/conversations", json={"agent_id": agent_id, "title": title}
        )
        response.raise_for_status()
        return response.json()["conversation_id"]

    async def send_message(self, conversation_id: str, content: str):
        """Send a message to the agent."""
        response = await self.client.post(
            f"/api/v1/chat/conversations/{conversation_id}/messages",
            json={"content": content},
        )
        response.raise_for_status()
        return response.json()

    async def execute_tool(
        self, conversation_id: str, tool_name: str, parameters: dict
    ):
        """Execute a tool in the conversation context."""
        response = await self.client.post(
            f"/api/v1/chat/conversations/{conversation_id}/tools",
            json={"tool_name": tool_name, "parameters": parameters},
        )
        response.raise_for_status()
        return response.json()

    async def get_conversation_messages(self, conversation_id: str):
        """Get messages from a conversation."""
        response = await self.client.get(
            f"/api/v1/chat/conversations/{conversation_id}/messages"
        )
        response.raise_for_status()
        return response.json()

    async def list_tools(self):
        """List available tools."""
        response = await self.client.get("/api/v1/chat/tools")
        response.raise_for_status()
        return response.json()

    async def list_skills(self):
        """List available skills."""
        response = await self.client.get("/api/v1/chat/skills")
        response.raise_for_status()
        return response.json()


async def main():
    """Run the demo."""
    # Note: In a real scenario, you would authenticate first to get an API token
    demo = AgentProvisionChatDemo()
    await demo.demo_chat_workflow()


if __name__ == "__main__":
    print(
        """
🤖 agentprovision Chat Interface Demo
=====================================

This demo shows how to:
1. List available agents and their capabilities
2. Create conversations with agents
3. Send natural language messages
4. Use tools through the chat interface
5. Execute code and manage files
6. Get intelligent responses and task execution

Make sure the agentprovision server is running on localhost:8001
and you have at least one agent created.

Starting demo...
"""
    )

    asyncio.run(main())
