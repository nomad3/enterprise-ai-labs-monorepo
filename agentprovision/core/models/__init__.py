# This file makes the 'models' directory a Python package

"""
Initializes the models package and makes model classes available.
"""

from .agent_model import Agent, AgentCreate, AgentResponse
from .audit_log_model import AuditLog
# Remove problematic import of non-existent models
# from .monitoring_model import MonitoringData, MonitoringDataCreate, MonitoringDataResponse, Metric, MetricCreate, MetricResponse
from .monitoring_model import CostMetrics  # Import existing models
from .monitoring_model import Alert, SystemMetrics
from .tenant_model import ResourceQuota, Tenant, TenantCreate, TenantResponse
from .user_model import User

__all__ = [
    "User",
    "Tenant",
    "TenantCreate",
    "TenantResponse",
    "ResourceQuota",
    "Agent",
    "AgentCreate",
    "AgentResponse",
    # Remove non-existent models from __all__
    # "MonitoringData",
    # "MonitoringDataCreate",
    # "MonitoringDataResponse",
    # "Metric",
    # "MetricCreate",
    # "MetricResponse",
    "SystemMetrics",  # Add existing models
    "Alert",
    "CostMetrics",
    "AuditLog",
]
