FROM python:3.11-slim

WORKDIR /app

# Install build tools and Python/Postgres headers
COPY requirements.txt ./
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    python3-dev \
    libffi-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH=/app

# Add a cache-busting argument (optional, but can help ensure freshness)
ARG CACHEBUST=1

# Copy the application code specifically
# Assuming your Docker build context is the root of the project,
# and your application code is in the 'devagent' subdirectory.
COPY ./devagent /app/devagent

CMD ["uvicorn", "devagent.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["tail", "-f", "/dev/null"] 