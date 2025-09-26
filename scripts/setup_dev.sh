#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# Database configuration
POSTGRES_USER=AgentProvision
POSTGRES_PASSWORD=AgentProvision
POSTGRES_DB=AgentProvision
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Application configuration
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=true
ENVIRONMENT=development

# Monitoring configuration
PROMETHEUS_MULTIPROC_DIR=/tmp
EOL
    echo ".env file created successfully"
fi

# Create necessary directories
mkdir -p /tmp/prometheus_multiproc

# Build and start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Run tests
echo "Running tests..."
docker-compose run --rm test

echo "Setup complete! You can now access:"
echo "- API documentation: http://localhost:8000/docs"
echo "- Health check: http://localhost:8000/health"
echo "- Metrics: http://localhost:8000/metrics"
