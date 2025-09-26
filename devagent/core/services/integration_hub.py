"""
Integration Hub Service for AgentProvision.

This service handles:
- Enterprise tool connectors
- API management and rate limiting
- Webhook system
- Event-driven architecture
- Custom integration framework
- Third-party integrations
"""

import asyncio
import logging
import json
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from uuid import UUID, uuid4
from enum import Enum
from dataclasses import dataclass, field

import aiohttp
import httpx
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy.orm import Session

from devagent.core.models.tenant_model import Tenant
from devagent.core.database import get_session
from devagent.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class IntegrationType(str, Enum):
    """Types of integrations supported."""
    SLACK = "slack"
    TEAMS = "teams"
    JIRA = "jira"
    GITHUB = "github"
    GITLAB = "gitlab"
    JENKINS = "jenkins"
    KUBERNETES = "kubernetes"
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    DATADOG = "datadog"
    PROMETHEUS = "prometheus"
    GRAFANA = "grafana"
    PAGERDUTY = "pagerduty"
    OKTA = "okta"
    AZURE_AD = "azure_ad"
    GOOGLE_WORKSPACE = "google_workspace"
    SALESFORCE = "salesforce"
    HUBSPOT = "hubspot"
    ZENDESK = "zendesk"
    CUSTOM = "custom"


class EventType(str, Enum):
    """Types of events that can be processed."""
    WEBHOOK = "webhook"
    API_CALL = "api_call"
    SCHEDULED = "scheduled"
    MANUAL = "manual"
    SYSTEM = "system"


class IntegrationStatus(str, Enum):
    """Status of an integration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    DISABLED = "disabled"


@dataclass
class IntegrationConfig:
    """Configuration for an integration."""
    id: UUID = field(default_factory=uuid4)
    tenant_id: int = 0
    name: str = ""
    integration_type: IntegrationType = IntegrationType.CUSTOM
    status: IntegrationStatus = IntegrationStatus.PENDING
    config: Dict[str, Any] = field(default_factory=dict)
    credentials: Dict[str, str] = field(default_factory=dict)
    webhook_url: Optional[str] = None
    webhook_secret: Optional[str] = None
    rate_limit: int = 100  # requests per minute
    timeout_seconds: int = 30
    retry_attempts: int = 3
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    last_used_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class WebhookEvent:
    """Represents a webhook event."""
    id: UUID = field(default_factory=uuid4)
    integration_id: UUID = field(default_factory=uuid4)
    tenant_id: int = 0
    event_type: str = ""
    payload: Dict[str, Any] = field(default_factory=dict)
    headers: Dict[str, str] = field(default_factory=dict)
    source_ip: str = ""
    received_at: datetime = field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    status: str = "pending"  # pending, processed, failed
    error_message: Optional[str] = None
    retry_count: int = 0


@dataclass
class APICall:
    """Represents an API call to an external service."""
    id: UUID = field(default_factory=uuid4)
    integration_id: UUID = field(default_factory=uuid4)
    tenant_id: int = 0
    method: str = "GET"
    url: str = ""
    headers: Dict[str, str] = field(default_factory=dict)
    payload: Optional[Dict[str, Any]] = None
    response_status: Optional[int] = None
    response_data: Optional[Dict[str, Any]] = None
    duration_ms: Optional[float] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class IntegrationConnector:
    """Base class for integration connectors."""

    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.client = None

    async def initialize(self) -> bool:
        """Initialize the connector."""
        return True

    async def test_connection(self) -> bool:
        """Test the connection to the external service."""
        return True

    async def send_message(self, message: str, **kwargs) -> bool:
        """Send a message through this integration."""
        return True

    async def get_data(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Get data from the external service."""
        return {}

    async def post_data(self, endpoint: str, data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Post data to the external service."""
        return {}

    async def handle_webhook(self, event: WebhookEvent) -> bool:
        """Handle a webhook event."""
        return True

    async def cleanup(self):
        """Cleanup resources."""
        if self.client:
            await self.client.aclose()


class SlackConnector(IntegrationConnector):
    """Slack integration connector."""

    async def initialize(self) -> bool:
        """Initialize Slack connector."""
        token = self.config.credentials.get("bot_token")
        if not token:
            logger.error("Slack bot token not provided")
            return False

        self.client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {token}"},
            timeout=self.config.timeout_seconds
        )
        return True

    async def test_connection(self) -> bool:
        """Test Slack connection."""
        try:
            response = await self.client.get("https://slack.com/api/auth.test")
            return response.status_code == 200 and response.json().get("ok", False)
        except Exception as e:
            logger.error(f"Slack connection test failed: {e}")
            return False

    async def send_message(self, message: str, channel: str = None, **kwargs) -> bool:
        """Send message to Slack."""
        try:
            channel = channel or self.config.config.get("default_channel", "#general")

            payload = {
                "channel": channel,
                "text": message,
                **kwargs
            }

            response = await self.client.post(
                "https://slack.com/api/chat.postMessage",
                json=payload
            )

            result = response.json()
            return result.get("ok", False)

        except Exception as e:
            logger.error(f"Failed to send Slack message: {e}")
            return False


class JiraConnector(IntegrationConnector):
    """Jira integration connector."""

    async def initialize(self) -> bool:
        """Initialize Jira connector."""
        base_url = self.config.config.get("base_url")
        username = self.config.credentials.get("username")
        api_token = self.config.credentials.get("api_token")

        if not all([base_url, username, api_token]):
            logger.error("Jira credentials incomplete")
            return False

        auth = httpx.BasicAuth(username, api_token)
        self.client = httpx.AsyncClient(
            base_url=base_url,
            auth=auth,
            timeout=self.config.timeout_seconds
        )
        return True

    async def test_connection(self) -> bool:
        """Test Jira connection."""
        try:
            response = await self.client.get("/rest/api/3/myself")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Jira connection test failed: {e}")
            return False

    async def create_issue(self, project_key: str, summary: str, description: str, issue_type: str = "Task") -> Dict[str, Any]:
        """Create a Jira issue."""
        try:
            payload = {
                "fields": {
                    "project": {"key": project_key},
                    "summary": summary,
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [{"type": "text", "text": description}]
                            }
                        ]
                    },
                    "issuetype": {"name": issue_type}
                }
            }

            response = await self.client.post("/rest/api/3/issue", json=payload)

            if response.status_code == 201:
                return response.json()
            else:
                logger.error(f"Failed to create Jira issue: {response.text}")
                return {}

        except Exception as e:
            logger.error(f"Failed to create Jira issue: {e}")
            return {}


class GitHubConnector(IntegrationConnector):
    """GitHub integration connector."""

    async def initialize(self) -> bool:
        """Initialize GitHub connector."""
        token = self.config.credentials.get("token")
        if not token:
            logger.error("GitHub token not provided")
            return False

        self.client = httpx.AsyncClient(
            base_url="https://api.github.com",
            headers={"Authorization": f"token {token}"},
            timeout=self.config.timeout_seconds
        )
        return True

    async def test_connection(self) -> bool:
        """Test GitHub connection."""
        try:
            response = await self.client.get("/user")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"GitHub connection test failed: {e}")
            return False

    async def create_issue(self, repo: str, title: str, body: str, labels: List[str] = None) -> Dict[str, Any]:
        """Create a GitHub issue."""
        try:
            payload = {
                "title": title,
                "body": body,
                "labels": labels or []
            }

            response = await self.client.post(f"/repos/{repo}/issues", json=payload)

            if response.status_code == 201:
                return response.json()
            else:
                logger.error(f"Failed to create GitHub issue: {response.text}")
                return {}

        except Exception as e:
            logger.error(f"Failed to create GitHub issue: {e}")
            return {}


class IntegrationHub:
    """
    Central hub for managing integrations and processing events.
    """

    def __init__(self):
        self.integrations: Dict[UUID, IntegrationConfig] = {}
        self.connectors: Dict[UUID, IntegrationConnector] = {}
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.webhook_events: List[WebhookEvent] = []
        self.api_calls: List[APICall] = []
        self._hub_running = False

    async def start_hub(self):
        """Start the integration hub."""
        self._hub_running = True
        logger.info("Integration Hub started")

        # Start background tasks
        asyncio.create_task(self._process_webhook_events())
        asyncio.create_task(self._health_check_integrations())
        asyncio.create_task(self._cleanup_old_events())

    async def stop_hub(self):
        """Stop the integration hub."""
        self._hub_running = False

        # Cleanup all connectors
        for connector in self.connectors.values():
            await connector.cleanup()

        logger.info("Integration Hub stopped")

    async def register_integration(self, config: IntegrationConfig) -> UUID:
        """Register a new integration."""
        logger.info(f"Registering integration {config.name} of type {config.integration_type}")

        # Create appropriate connector
        connector = self._create_connector(config)

        if connector and await connector.initialize():
            if await connector.test_connection():
                config.status = IntegrationStatus.ACTIVE
                self.integrations[config.id] = config
                self.connectors[config.id] = connector
                logger.info(f"Integration {config.name} registered successfully")
            else:
                config.status = IntegrationStatus.ERROR
                logger.error(f"Integration {config.name} failed connection test")
        else:
            config.status = IntegrationStatus.ERROR
            logger.error(f"Failed to initialize integration {config.name}")

        return config.id

    async def unregister_integration(self, integration_id: UUID) -> bool:
        """Unregister an integration."""
        if integration_id in self.connectors:
            await self.connectors[integration_id].cleanup()
            del self.connectors[integration_id]

        if integration_id in self.integrations:
            del self.integrations[integration_id]
            logger.info(f"Integration {integration_id} unregistered")
            return True

        return False

    async def get_integration(self, integration_id: UUID) -> Optional[IntegrationConfig]:
        """Get an integration by ID."""
        return self.integrations.get(integration_id)

    async def get_tenant_integrations(self, tenant_id: int) -> List[IntegrationConfig]:
        """Get all integrations for a tenant."""
        return [
            config for config in self.integrations.values()
            if config.tenant_id == tenant_id
        ]

    async def send_message(self, integration_id: UUID, message: str, **kwargs) -> bool:
        """Send a message through an integration."""
        connector = self.connectors.get(integration_id)
        if not connector:
            logger.error(f"Integration {integration_id} not found")
            return False

        try:
            return await connector.send_message(message, **kwargs)
        except Exception as e:
            logger.error(f"Failed to send message through integration {integration_id}: {e}")
            return False

    async def make_api_call(self, integration_id: UUID, method: str, endpoint: str, data: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """Make an API call through an integration."""
        connector = self.connectors.get(integration_id)
        if not connector:
            logger.error(f"Integration {integration_id} not found")
            return {}

        api_call = APICall(
            integration_id=integration_id,
            tenant_id=self.integrations[integration_id].tenant_id,
            method=method,
            url=endpoint
        )

        try:
            start_time = datetime.utcnow()

            if method.upper() == "GET":
                result = await connector.get_data(endpoint, **kwargs)
            elif method.upper() == "POST":
                result = await connector.post_data(endpoint, data or {}, **kwargs)
            else:
                raise ValueError(f"Unsupported method: {method}")

            api_call.completed_at = datetime.utcnow()
            api_call.duration_ms = (api_call.completed_at - start_time).total_seconds() * 1000
            api_call.response_data = result

            self.api_calls.append(api_call)
            return result

        except Exception as e:
            api_call.error_message = str(e)
            api_call.completed_at = datetime.utcnow()
            self.api_calls.append(api_call)
            logger.error(f"API call failed for integration {integration_id}: {e}")
            return {}

    async def process_webhook(self, integration_id: UUID, payload: Dict[str, Any], headers: Dict[str, str], source_ip: str) -> bool:
        """Process a webhook event."""
        integration = self.integrations.get(integration_id)
        if not integration:
            logger.error(f"Integration {integration_id} not found for webhook")
            return False

        # Verify webhook signature if secret is configured
        if integration.webhook_secret:
            if not self._verify_webhook_signature(payload, headers, integration.webhook_secret):
                logger.error(f"Webhook signature verification failed for integration {integration_id}")
                return False

        event = WebhookEvent(
            integration_id=integration_id,
            tenant_id=integration.tenant_id,
            event_type=headers.get("X-Event-Type", "unknown"),
            payload=payload,
            headers=headers,
            source_ip=source_ip
        )

        self.webhook_events.append(event)
        logger.info(f"Webhook event queued for integration {integration_id}")
        return True

    def register_event_handler(self, event_type: str, handler: Callable):
        """Register an event handler."""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []

        self.event_handlers[event_type].append(handler)
        logger.info(f"Event handler registered for {event_type}")

    async def emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emit an event to all registered handlers."""
        handlers = self.event_handlers.get(event_type, [])

        for handler in handlers:
            try:
                await handler(data)
            except Exception as e:
                logger.error(f"Event handler failed for {event_type}: {e}")

    def _create_connector(self, config: IntegrationConfig) -> Optional[IntegrationConnector]:
        """Create appropriate connector based on integration type."""
        connector_map = {
            IntegrationType.SLACK: SlackConnector,
            IntegrationType.JIRA: JiraConnector,
            IntegrationType.GITHUB: GitHubConnector,
            # Add more connectors as needed
        }

        connector_class = connector_map.get(config.integration_type)
        if connector_class:
            return connector_class(config)

        # Default to base connector for custom integrations
        return IntegrationConnector(config)

    def _verify_webhook_signature(self, payload: Dict[str, Any], headers: Dict[str, str], secret: str) -> bool:
        """Verify webhook signature."""
        signature = headers.get("X-Hub-Signature-256") or headers.get("X-Slack-Signature")
        if not signature:
            return False

        # Create expected signature
        payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()

        # Compare signatures
        return hmac.compare_digest(signature, f"sha256={expected_signature}")

    async def _process_webhook_events(self):
        """Background task to process webhook events."""
        while self._hub_running:
            try:
                events_to_process = [e for e in self.webhook_events if e.status == "pending"]

                for event in events_to_process:
                    await self._process_single_webhook_event(event)

                await asyncio.sleep(1)  # Process every second

            except Exception as e:
                logger.error(f"Error processing webhook events: {e}")
                await asyncio.sleep(5)

    async def _process_single_webhook_event(self, event: WebhookEvent):
        """Process a single webhook event."""
        try:
            connector = self.connectors.get(event.integration_id)
            if connector:
                success = await connector.handle_webhook(event)

                if success:
                    event.status = "processed"
                    event.processed_at = datetime.utcnow()

                    # Emit event for other systems to handle
                    await self.emit_event("webhook_processed", {
                        "integration_id": str(event.integration_id),
                        "tenant_id": event.tenant_id,
                        "event_type": event.event_type,
                        "payload": event.payload
                    })
                else:
                    event.status = "failed"
                    event.error_message = "Connector failed to process webhook"
            else:
                event.status = "failed"
                event.error_message = "Connector not found"

        except Exception as e:
            event.status = "failed"
            event.error_message = str(e)
            logger.error(f"Failed to process webhook event {event.id}: {e}")

    async def _health_check_integrations(self):
        """Background task to health check integrations."""
        while self._hub_running:
            try:
                for integration_id, connector in self.connectors.items():
                    config = self.integrations[integration_id]

                    if await connector.test_connection():
                        if config.status != IntegrationStatus.ACTIVE:
                            config.status = IntegrationStatus.ACTIVE
                            logger.info(f"Integration {integration_id} is now healthy")
                    else:
                        if config.status == IntegrationStatus.ACTIVE:
                            config.status = IntegrationStatus.ERROR
                            logger.error(f"Integration {integration_id} health check failed")

                await asyncio.sleep(300)  # Check every 5 minutes

            except Exception as e:
                logger.error(f"Error in integration health check: {e}")
                await asyncio.sleep(600)

    async def _cleanup_old_events(self):
        """Background task to cleanup old events."""
        while self._hub_running:
            try:
                cutoff_time = datetime.utcnow() - timedelta(days=7)

                # Cleanup old webhook events
                self.webhook_events = [
                    e for e in self.webhook_events
                    if e.received_at > cutoff_time
                ]

                # Cleanup old API calls
                self.api_calls = [
                    c for c in self.api_calls
                    if c.created_at > cutoff_time
                ]

                await asyncio.sleep(3600)  # Cleanup every hour

            except Exception as e:
                logger.error(f"Error cleaning up old events: {e}")
                await asyncio.sleep(3600)

    async def get_integration_metrics(self, tenant_id: int) -> Dict[str, Any]:
        """Get integration metrics for a tenant."""
        tenant_integrations = await self.get_tenant_integrations(tenant_id)

        total_integrations = len(tenant_integrations)
        active_integrations = len([i for i in tenant_integrations if i.status == IntegrationStatus.ACTIVE])

        # Count events and API calls for this tenant
        tenant_webhook_events = [e for e in self.webhook_events if e.tenant_id == tenant_id]
        tenant_api_calls = [c for c in self.api_calls if c.tenant_id == tenant_id]

        # Calculate success rates
        processed_events = len([e for e in tenant_webhook_events if e.status == "processed"])
        failed_events = len([e for e in tenant_webhook_events if e.status == "failed"])

        successful_api_calls = len([c for c in tenant_api_calls if c.error_message is None])
        failed_api_calls = len([c for c in tenant_api_calls if c.error_message is not None])

        return {
            "tenant_id": tenant_id,
            "integrations": {
                "total": total_integrations,
                "active": active_integrations,
                "inactive": total_integrations - active_integrations
            },
            "webhook_events": {
                "total": len(tenant_webhook_events),
                "processed": processed_events,
                "failed": failed_events,
                "success_rate": (processed_events / len(tenant_webhook_events) * 100) if tenant_webhook_events else 0
            },
            "api_calls": {
                "total": len(tenant_api_calls),
                "successful": successful_api_calls,
                "failed": failed_api_calls,
                "success_rate": (successful_api_calls / len(tenant_api_calls) * 100) if tenant_api_calls else 0
            },
            "timestamp": datetime.utcnow()
        }


# Global integration hub instance
integration_hub = IntegrationHub()


async def get_integration_hub() -> IntegrationHub:
    """Get the global integration hub instance."""
    return integration_hub
