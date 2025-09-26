from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from AgentProvision.core.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # Link to User model
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    action = Column(
        String, index=True
    )  # e.g., "user_login", "agent_create", "tenant_update"
    details = Column(JSON, nullable=True)  # Additional details about the event

    tenant = relationship("Tenant", back_populates="audit_logs")
    user = relationship(
        "User", back_populates="audit_logs"
    )  # Assumes User model will have audit_logs relationship

    def __repr__(self):
        return f"<AuditLog {self.id} - {self.action} by User {self.user_id} in Tenant {self.tenant_id}>"
