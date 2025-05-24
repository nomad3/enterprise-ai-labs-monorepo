"""
DevOps API endpoints for monitoring, alerting, and infrastructure management.
"""

from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from devagent.core.config import get_settings
from devagent.core.devops.service import DevOpsService

router = APIRouter(prefix="/devops", tags=["devops"])
settings = get_settings()

# Initialize DevOps service
devops_service = DevOpsService(
    prometheus_url=settings.PROMETHEUS_URL, grafana_url=settings.GRAFANA_URL
)


class IncidentCreate(BaseModel):
    """Model for creating a new incident."""

    title: str
    severity: str
    description: str


class IncidentUpdate(BaseModel):
    """Model for updating an incident."""

    status: Optional[str] = None
    updates: Optional[List[str]] = None


@router.get("/metrics/system")
async def get_system_metrics():
    """Get current system metrics."""
    metrics = await devops_service.get_system_metrics()
    if not metrics:
        raise HTTPException(status_code=500, detail="Failed to fetch system metrics")
    return metrics


@router.get("/metrics/application")
async def get_application_metrics():
    """Get application performance metrics."""
    metrics = await devops_service.get_application_metrics()
    if not metrics:
        raise HTTPException(
            status_code=500, detail="Failed to fetch application metrics"
        )
    return metrics


@router.get("/alerts")
async def get_alerts():
    """Get current alert status."""
    alerts = await devops_service.get_alert_status()
    return alerts


@router.get("/incidents")
async def get_incidents(days: int = 7):
    """Get incident history."""
    incidents = await devops_service.get_incident_history(days)
    return incidents


@router.post("/incidents")
async def create_incident(incident: IncidentCreate):
    """Create a new incident."""
    new_incident = await devops_service.create_incident(incident.dict())
    return new_incident


@router.put("/incidents/{incident_id}")
async def update_incident(incident_id: str, update: IncidentUpdate):
    """Update an existing incident."""
    updated_incident = await devops_service.update_incident(
        incident_id, update.dict(exclude_unset=True)
    )
    return updated_incident


@router.get("/dashboards/{dashboard_id}")
async def get_dashboard(dashboard_id: str):
    """Get dashboard data."""
    dashboard = await devops_service.get_dashboard_data(dashboard_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dashboard
