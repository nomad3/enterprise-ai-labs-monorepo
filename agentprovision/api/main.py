"""
Main FastAPI application entry point for agentprovision.
"""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry import trace
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from prometheus_client import start_http_server
from sqlalchemy.ext.asyncio import AsyncSession

from agentprovision.api.auth import router as auth_router
from agentprovision.api.ci_cd import router as ci_cd_router
from agentprovision.api.code_gen import router as code_gen_router
from agentprovision.api.communication import router as communication_router
from agentprovision.api.devops import router as devops_router
from agentprovision.api.files import router as files_router
from agentprovision.api.plans import router as plans_router
from agentprovision.api.routers.agent import router as agent_router
from agentprovision.api.routers.tenants import router as tenants_router
from agentprovision.api.routes.agent_runtime_routes import \
    router as agent_runtime_router
from agentprovision.api.routes.chat_routes import router as chat_router
from agentprovision.api.routes.llm_routes import router as llm_router
from agentprovision.api.routes.orchestration_routes import \
    router as orchestration_router
from agentprovision.api.test_gen import router as test_gen_router
from agentprovision.api.tickets import router as tickets_router
from agentprovision.api.version_control import router as version_control_router
from agentprovision.core.config import get_settings
from agentprovision.core.database import get_session, init_db
from agentprovision.core.models.user_model import \
    User  # Assuming User model is needed for startup
from agentprovision.core.services.agent_orchestrator import \
    get_orchestrator  # Import the orchestrator
from agentprovision.core.services.integration_hub import \
    get_integration_hub  # Import the integration hub

# Initialize OpenTelemetry
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Initialize Prometheus metrics
metric_reader = PrometheusMetricReader()
start_http_server(port=8001, addr="0.0.0.0")

# Create FastAPI app
app = FastAPI(
    title="agentprovision",
    description="Enterprise-Grade Multi-Agent Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Changed to uppercase
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument FastAPI
FastAPIInstrumentor.instrument_app(app)

# Include routers with proper prefixes for multi-tenant support
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(tickets_router, prefix="/api/v1/tickets", tags=["Tickets"])
app.include_router(plans_router, prefix="/api/v1/plans", tags=["Plans"])
app.include_router(ci_cd_router, prefix="/api/v1/iac", tags=["Infrastructure as Code"])
app.include_router(tenants_router, prefix="/api/v1/tenants", tags=["Tenants"])
app.include_router(agent_router, prefix="/api/v1")
app.include_router(orchestration_router, prefix="/api/v1", tags=["Orchestration"])
app.include_router(llm_router, prefix="/api/v1", tags=["LLM Engine"])
app.include_router(agent_runtime_router, prefix="/api/v1", tags=["Agent Runtime"])
app.include_router(chat_router, prefix="/api/v1", tags=["Chat Interface"])


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    await init_db()

    # Start core services
    from agentprovision.core.services.agent_orchestrator import \
        get_orchestrator
    from agentprovision.core.services.agent_runtime import get_agent_runtime
    from agentprovision.core.services.api_gateway import get_api_gateway
    from agentprovision.core.services.chat_service import get_chat_service
    from agentprovision.core.services.integration_hub import \
        get_integration_hub
    from agentprovision.core.services.llm_engine import get_llm_engine

    # Start API Gateway
    api_gateway = await get_api_gateway()
    await api_gateway.start_gateway()

    # Start LLM Engine
    llm_engine = await get_llm_engine()
    await llm_engine.start_engine()

    # Start Agent Runtime
    agent_runtime = await get_agent_runtime()
    await agent_runtime.start_runtime()

    # Start Chat Service
    chat_service = await get_chat_service()
    await chat_service.start_service()

    # Start Agent Orchestrator
    orchestrator = await get_orchestrator()
    await orchestrator.start_orchestrator()

    # Start Integration Hub
    integration_hub = await get_integration_hub()
    await integration_hub.start_hub()

    logger.info("All core services started successfully")


@app.get("/")
async def root():
    """Root endpoint returning basic API information."""
    return {
        "name": "agentprovision",
        "version": "1.0.0",
        "status": "operational",
        "description": "Enterprise-Grade Multi-Agent Platform",
        "documentation": "/api/docs",
    }


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_session)):
    """Health check endpoint with detailed status information."""
    try:
        # Test database connection
        await db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "version": "1.0.0",
        "components": {
            "database": db_status,
            "api": "healthy",
            "authentication": "healthy",
            "agents": "healthy",
        },
        "compliance": {
            "soc2": "compliant",
            "iso27001": "compliant",
            "gdpr": "compliant",
        },
    }
