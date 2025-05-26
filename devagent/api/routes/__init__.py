from fastapi import APIRouter
from .auth_routes import router as auth_router
from .user_routes import router as user_router
from .tenant_routes import router as tenant_router
from .agent_routes import router as agent_router
from .monitoring_routes import router as monitoring_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(user_router)
router.include_router(tenant_router)
router.include_router(agent_router)
router.include_router(monitoring_router) 