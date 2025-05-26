FROM python:3.11-slim

WORKDIR /app

# Install build tools and Python/Postgres headers
# Since the build context is 'devagent/', 'requirements.txt' is at the root of the context.
COPY requirements.txt ./requirements.txt
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
# Since the build context is 'devagent/', '.' refers to the 'devagent/' directory itself.
# We want to copy its contents into /app in the image.
COPY . /app

CMD ["uvicorn", "devagent.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["tail", "-f", "/dev/null"] 