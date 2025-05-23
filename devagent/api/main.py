"""
Main FastAPI application entry point for DevAgent.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.prometheus import PrometheusSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from devagent.core.database import init_db, get_session
from devagent.api.tickets import router as tickets_router
from devagent.api.plans import router as plans_router
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize tracer
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Create FastAPI app
app = FastAPI(
    title="DevAgent",
    description="Full-Stack Developer & DevOps AI Agent",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Instrument FastAPI with OpenTelemetry
FastAPIInstrumentor.instrument_app(app)

# Include routers
app.include_router(tickets_router)
app.include_router(plans_router)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    await init_db()

@app.get("/")
async def root():
    """Root endpoint returning basic API information."""
    return {
        "name": "DevAgent",
        "version": "0.1.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_session)):
    """Health check endpoint."""
    # Test database connection
    try:
        await db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "version": "0.1.0"
    } 