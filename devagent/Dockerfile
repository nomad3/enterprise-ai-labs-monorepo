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

# The build context is the 'devagent' directory.
# requirements.txt is one level up from the current build context.
COPY ../requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the application code from the current build context (which is the 'devagent' directory)
# into /app/devagent in the image.
# The source '.' refers to the root of the build context.
COPY . /app/devagent

# Set PYTHONPATH to include /app.
# The application code (e.g., api/main.py) will be at /app/devagent/api/main.py.
# Python will find the 'devagent' package in /app/devagent.
ENV PYTHONPATH=/app

# The CMD should refer to devagent.api.main:app
CMD ["uvicorn", "devagent.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD ["tail", "-f", "/dev/null"] 