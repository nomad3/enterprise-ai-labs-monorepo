"""
Main FastAPI application entry point for DevAgent.
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

from devagent.api.plans import router as plans_router
from devagent.api.tickets import router as tickets_router
from devagent.api.code_gen import router as code_gen_router
from devagent.api.test_gen import router as test_gen_router
from devagent.api.version_control import router as version_control_router
from devagent.api.ci_cd import router as ci_cd_router
from devagent.core.database import get_session, init_db

# Initialize OpenTelemetry
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Initialize Prometheus metrics
metric_reader = PrometheusMetricReader()
start_http_server(port=8001, addr="0.0.0.0")

# Create FastAPI app
app = FastAPI(
    title="DevAgent",
    description="Full-Stack Developer & DevOps AI Agent",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument FastAPI
FastAPIInstrumentor.instrument_app(app)

# Include routers
app.include_router(tickets_router)
app.include_router(plans_router)
app.include_router(code_gen_router)
app.include_router(test_gen_router)
app.include_router(version_control_router)
app.include_router(ci_cd_router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    await init_db()


@app.get("/")
async def root():
    """Root endpoint returning basic API information."""
    return {"name": "DevAgent", "version": "0.1.0", "status": "operational"}


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_session)):
    """Health check endpoint."""
    # Test database connection
    try:
        await db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {"status": "healthy", "database": db_status, "version": "0.1.0"}
