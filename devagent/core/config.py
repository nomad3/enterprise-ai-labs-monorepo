"""
Configuration settings for the AgentForge application.
"""

from functools import lru_cache
from typing import List, Optional, Dict, Any

from pydantic import BaseSettings, root_validator


class Settings(BaseSettings):
    """Application settings."""

    # Application settings
    PROJECT_NAME: str = "AgentForge"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development, staging, production

    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/agentforge"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = False

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_POOL_SIZE: int = 10

    # Authentication settings
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_MIN_LENGTH: int = 12
    PASSWORD_REQUIRE_SPECIAL: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_UPPERCASE: bool = True

    # Multi-tenant settings
    TENANT_HEADER: str = "X-Tenant-ID"
    DEFAULT_TENANT: str = "default"
    TENANT_ISOLATION_LEVEL: str = "strict"  # strict, relaxed, none

    # CORS settings - Environment variables should be comma-separated strings
    BACKEND_CORS_ORIGINS_ENV: Optional[str] = None
    ALLOWED_ORIGINS_ENV: Optional[str] = None
    
    # These will be populated by the root_validator based on _ENV vars or use these defaults
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3002"]
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3002"]

    @root_validator(pre=False) # Using pre=False to run after initial field population
    def assemble_cors_settings(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        backend_cors_env = values.get("BACKEND_CORS_ORIGINS_ENV")
        if isinstance(backend_cors_env, str) and backend_cors_env:
            values["BACKEND_CORS_ORIGINS"] = [item.strip() for item in backend_cors_env.split(",") if item.strip()]
        
        allowed_origins_env = values.get("ALLOWED_ORIGINS_ENV")
        if isinstance(allowed_origins_env, str) and allowed_origins_env:
            values["ALLOWED_ORIGINS"] = [item.strip() for item in allowed_origins_env.split(",") if item.strip()]
        
        return values

    # Monitoring settings
    PROMETHEUS_URL: str = "http://localhost:9090"
    GRAFANA_URL: str = "http://localhost:3001"
    LOG_LEVEL: str = "INFO"
    ENABLE_TRACING: bool = True
    ENABLE_METRICS: bool = True

    # Alert settings
    ALERT_EMAIL_ENABLED: bool = False
    ALERT_EMAIL_SMTP_SERVER: str = "smtp.gmail.com"
    ALERT_EMAIL_SMTP_PORT: int = 587
    ALERT_EMAIL_USERNAME: str = ""
    ALERT_EMAIL_PASSWORD: str = ""

    # Incident management settings
    INCIDENT_SLACK_WEBHOOK: str = ""
    INCIDENT_TEAMS_WEBHOOK: str = ""
    INCIDENT_PAGERDUTY_KEY: Optional[str] = None

    # Compliance settings
    ENABLE_AUDIT_LOGGING: bool = True
    AUDIT_LOG_RETENTION_DAYS: int = 365
    COMPLIANCE_FRAMEWORKS: List[str] = ["SOC2", "ISO27001", "GDPR"]
    DATA_RETENTION_DAYS: int = 90

    # Agent settings
    MAX_AGENTS_PER_TENANT: int = 100
    AGENT_EXECUTION_TIMEOUT: int = 300  # seconds
    AGENT_MEMORY_LIMIT: int = 512  # MB
    AGENT_CPU_LIMIT: int = 1  # cores

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Security settings
    ENABLE_2FA: bool = True
    SESSION_TIMEOUT_MINUTES: int = 30
    MAX_LOGIN_ATTEMPTS: int = 5
    LOGIN_BLOCK_DURATION_MINUTES: int = 15
    PASSWORD_RESET_TIMEOUT_MINUTES: int = 30

    class Config:
        """Pydantic config."""
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = 'utf-8' # Added for robustness


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings."""
    return Settings()
