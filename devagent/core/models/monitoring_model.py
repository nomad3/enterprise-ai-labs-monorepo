from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID, uuid4

class SystemMetrics(BaseModel):
    model_config = ConfigDict(extra="allow")
    
    cpu_usage: float = Field(default=0.0, description="CPU usage percentage")
    memory_usage: float = Field(default=0.0, description="Memory usage percentage")
    storage_usage: float = Field(default=0.0, description="Storage usage percentage")
    network_in: float = Field(default=0.0, description="Network incoming traffic in MB/s")
    network_out: float = Field(default=0.0, description="Network outgoing traffic in MB/s")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Alert(BaseModel):
    model_config = ConfigDict(extra="allow")
    
    id: UUID = Field(default_factory=uuid4)
    severity: str = Field(..., description="Alert severity (critical, warning, info)")
    message: str = Field(..., description="Alert message")
    source: str = Field(..., description="Source of the alert (system, agent, tenant)")
    source_id: UUID = Field(..., description="ID of the source (agent_id, tenant_id, etc.)")
    status: str = Field(default="active", description="Alert status (active, resolved, acknowledged)")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class CostMetrics(BaseModel):
    model_config = ConfigDict(
        extra="allow",
        json_schema_extra={
            "example": {
                "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
                "period": "2024-03",
                "compute_cost": 8200.0,
                "storage_cost": 2450.0,
                "network_cost": 1800.0,
                "total_cost": 12450.0,
                "currency": "USD"
            }
        } 
    )
    
    tenant_id: UUID = Field(..., description="ID of the tenant")
    period: str = Field(..., description="Billing period (e.g., '2024-03')")
    compute_cost: float = Field(default=0.0, description="Compute resources cost")
    storage_cost: float = Field(default=0.0, description="Storage resources cost")
    network_cost: float = Field(default=0.0, description="Network resources cost")
    total_cost: float = Field(default=0.0, description="Total cost for the period")
    currency: str = Field(default="USD", description="Currency code") 