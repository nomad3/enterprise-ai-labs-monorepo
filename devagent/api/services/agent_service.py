from datetime import datetime
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from devagent.api.schemas.agent import AgentCreate, AgentUpdate
from devagent.core.models.agent_model import Agent


async def create_agent(db: AsyncSession, agent_in: AgentCreate) -> Agent:
    agent = Agent(**agent_in.dict())
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent


async def get_agent(db: AsyncSession, agent_id: int) -> Optional[Agent]:
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    return result.scalar_one_or_none()


async def list_agents(db: AsyncSession) -> List[Agent]:
    result = await db.execute(select(Agent))
    return result.scalars().all()


async def update_agent(db: AsyncSession, agent_id: int, agent_in: AgentUpdate) -> Agent:
    agent = await get_agent(db, agent_id)
    if not agent:
        raise ValueError("Agent not found")
    for field, value in agent_in.dict(exclude_unset=True).items():
        setattr(agent, field, value)
    agent.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(agent)
    return agent


async def delete_agent(db: AsyncSession, agent_id: int) -> None:
    agent = await get_agent(db, agent_id)
    if not agent:
        raise ValueError("Agent not found")
    await db.delete(agent)
    await db.commit()
