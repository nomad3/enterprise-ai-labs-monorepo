"""
Infrastructure as Code Routes for agentprovision
API endpoints for Terraform, Kubernetes, and Helm capabilities
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..services.iac_service import IACService

router = APIRouter(prefix="/api/iac", tags=["iac"])
iac_service = IACService()


@router.post("/terraform")
async def generate_terraform(
    requirements: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generate Terraform code based on requirements
    """
    try:
        result = await iac_service.generate_terraform(requirements)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/kubernetes/troubleshoot")
async def troubleshoot_kubernetes(
    issue_description: str, current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Analyze and troubleshoot Kubernetes issues
    """
    try:
        result = await iac_service.troubleshoot_kubernetes(issue_description)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/helm")
async def generate_helm_chart(
    requirements: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Generate Helm chart based on requirements
    """
    try:
        result = await iac_service.generate_helm_chart(requirements)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{request_type}")
async def process_iac_request(
    request_type: str,
    requirements: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Process IaC generation request
    """
    try:
        result = await iac_service.process_iac_request(request_type, requirements)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
