"""
DevOps Service for monitoring, alerting, and infrastructure management.
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional

import aiohttp
from prometheus_client import Counter, Gauge, Histogram

# Prometheus metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

system_resources = Gauge(
    'system_resources',
    'System resource usage',
    ['resource_type']
)

class DevOpsService:
    """Service for managing DevOps operations."""

    def __init__(self, prometheus_url: str, grafana_url: str):
        """Initialize the DevOps service."""
        self.prometheus_url = prometheus_url
        self.grafana_url = grafana_url
        self.logger = logging.getLogger(__name__)

    async def get_system_metrics(self) -> Dict:
        """Get current system metrics."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.prometheus_url}/api/v1/query", params={
                    'query': 'node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes'
                }) as response:
                    memory_data = await response.json()
                
                async with session.get(f"{self.prometheus_url}/api/v1/query", params={
                    'query': '100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'
                }) as response:
                    cpu_data = await response.json()

            return {
                'memory_usage': float(memory_data['data']['result'][0]['value'][1]),
                'cpu_usage': float(cpu_data['data']['result'][0]['value'][1]),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error fetching system metrics: {e}")
            return {}

    async def get_application_metrics(self) -> Dict:
        """Get application performance metrics."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.prometheus_url}/api/v1/query", params={
                    'query': 'rate(http_requests_total[5m])'
                }) as response:
                    request_rate = await response.json()
                
                async with session.get(f"{self.prometheus_url}/api/v1/query", params={
                    'query': 'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])'
                }) as response:
                    error_rate = await response.json()

            return {
                'request_rate': float(request_rate['data']['result'][0]['value'][1]),
                'error_rate': float(error_rate['data']['result'][0]['value'][1]),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error fetching application metrics: {e}")
            return {}

    async def get_alert_status(self) -> List[Dict]:
        """Get current alert status."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.prometheus_url}/api/v1/alerts") as response:
                    alerts = await response.json()

            return [{
                'name': alert['labels']['alertname'],
                'severity': alert['labels']['severity'],
                'status': alert['status']['state'],
                'description': alert['annotations']['description'],
                'start_time': alert['startsAt']
            } for alert in alerts['data']['alerts']]
        except Exception as e:
            self.logger.error(f"Error fetching alerts: {e}")
            return []

    async def get_incident_history(self, days: int = 7) -> List[Dict]:
        """Get incident history for the specified period."""
        # This would typically query a database or incident management system
        # For now, we'll return a mock response
        return [{
            'id': 'INC-001',
            'title': 'High Error Rate Detected',
            'severity': 'critical',
            'status': 'resolved',
            'start_time': '2024-03-15T10:00:00Z',
            'end_time': '2024-03-15T10:30:00Z',
            'root_cause': 'Database connection pool exhaustion',
            'resolution': 'Increased connection pool size and added connection timeout'
        }]

    async def create_incident(self, incident_data: Dict) -> Dict:
        """Create a new incident."""
        # This would typically create an incident in an incident management system
        # For now, we'll return a mock response
        return {
            'id': f"INC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'title': incident_data['title'],
            'severity': incident_data['severity'],
            'status': 'open',
            'start_time': datetime.utcnow().isoformat(),
            'description': incident_data['description']
        }

    async def update_incident(self, incident_id: str, update_data: Dict) -> Dict:
        """Update an existing incident."""
        # This would typically update an incident in an incident management system
        # For now, we'll return a mock response
        return {
            'id': incident_id,
            'status': update_data.get('status', 'open'),
            'updated_at': datetime.utcnow().isoformat(),
            'updates': update_data.get('updates', [])
        }

    async def get_dashboard_data(self, dashboard_id: str) -> Dict:
        """Get dashboard data from Grafana."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.grafana_url}/api/dashboards/uid/{dashboard_id}"
                ) as response:
                    dashboard = await response.json()

            return {
                'title': dashboard['dashboard']['title'],
                'panels': dashboard['dashboard']['panels'],
                'last_updated': dashboard['meta']['updated']
            }
        except Exception as e:
            self.logger.error(f"Error fetching dashboard data: {e}")
            return {} 