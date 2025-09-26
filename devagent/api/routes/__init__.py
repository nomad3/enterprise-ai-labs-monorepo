from fastapi import APIRouter

from .agent_routes import router as agent_router
from .monitoring_routes import router as monitoring_router
from .orchestration_routes import router as orchestration_router
from .tenant_routes import router as tenant_router

router = APIRouter()

router.include_router(tenant_router)
router.include_router(agent_router)
router.include_router(monitoring_router)
router.include_router(orchestration_router)
