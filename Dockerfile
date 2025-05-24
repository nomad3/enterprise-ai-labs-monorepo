# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        build-essential \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir black isort flake8 mypy pytest pytest-cov

# Copy project files
COPY . .

# Create a non-root user
RUN useradd -m -u 1000 devagent
USER devagent

# Command to run the application
CMD ["uvicorn", "devagent.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 