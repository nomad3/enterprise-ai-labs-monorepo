from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agentprovision.core.communication.notification import NotificationService

router = APIRouter(prefix="/notify", tags=["communication"])

notification_service = NotificationService()


class NotificationRequest(BaseModel):
    message: str


@router.post("/slack")
def notify_slack(request: NotificationRequest):
    result = notification_service.send_to_slack(request.message)
    return {"result": result}


@router.post("/teams")
def notify_teams(request: NotificationRequest):
    result = notification_service.send_to_teams(request.message)
    return {"result": result}


@router.post("/mock/slack")
def mock_notify_slack(request: NotificationRequest):
    result = notification_service.mock_send_to_slack(request.message)
    return {"result": result}


@router.post("/mock/teams")
def mock_notify_teams(request: NotificationRequest):
    result = notification_service.mock_send_to_teams(request.message)
    return {"result": result}
