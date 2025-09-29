from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from agentprovision.api.schemas.agent import (AgentCreate, AgentRead,
                                              AgentUpdate)
from agentprovision.api.services.agent_service import (create_agent,
                                                       delete_agent, get_agent,
                                                       list_agents,
                                                       update_agent)
from agentprovision.core.database import get_session

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post("/", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
async def create_agent_endpoint(
    agent: AgentCreate, db: AsyncSession = Depends(get_session)
):
    return await create_agent(db, agent)


@router.get("/", response_model=List[AgentRead])
async def list_agents_endpoint(db: AsyncSession = Depends(get_session)):
    return await list_agents(db)


@router.get("/{agent_id}", response_model=AgentRead)
async def get_agent_endpoint(agent_id: int, db: AsyncSession = Depends(get_session)):
    agent = await get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentRead)
async def update_agent_endpoint(
    agent_id: int, agent: AgentUpdate, db: AsyncSession = Depends(get_session)
):
    return await update_agent(db, agent_id, agent)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent_endpoint(agent_id: int, db: AsyncSession = Depends(get_session)):
    await delete_agent(db, agent_id)
    return None
