"""
Configuration settings for the DevAgent application.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/devagent"

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT settings
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DevAgent"

    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3002"]

    # Monitoring settings
    PROMETHEUS_URL: str = "http://localhost:9090"
    GRAFANA_URL: str = "http://localhost:3001"

    # Alert settings
    ALERT_EMAIL_ENABLED: bool = False
    ALERT_EMAIL_SMTP_SERVER: str = "smtp.gmail.com"
    ALERT_EMAIL_SMTP_PORT: int = 587
    ALERT_EMAIL_USERNAME: str = ""
    ALERT_EMAIL_PASSWORD: str = ""

    # Incident management settings
    INCIDENT_SLACK_WEBHOOK: str = ""
    INCIDENT_TEAMS_WEBHOOK: str = ""

    class Config:
        """Pydantic config."""

        case_sensitive = True
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings."""
    return Settings()
