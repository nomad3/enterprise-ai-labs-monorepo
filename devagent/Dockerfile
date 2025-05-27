FROM python:3.11-slim

WORKDIR /app

# Install build tools and Python/Postgres headers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    python3-dev \
    libffi-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip setuptools wheel

# Copy only the requirements.txt file first to leverage Docker cache
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the devagent application code into /app
# This assumes the Docker build context is the project root,
# and we are copying the 'devagent' subdirectory from the project root into /app.
COPY ./devagent /app/devagent

# Set PYTHONPATH to include the /app directory, so 'import devagent.xxx' works
ENV PYTHONPATH=/app

# The CMD should refer to devagent.api.main:app, which will be found
# at /app/devagent/api/main.py thanks to PYTHONPATH.
CMD ["uvicorn", "devagent.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["tail", "-f", "/dev/null"] 