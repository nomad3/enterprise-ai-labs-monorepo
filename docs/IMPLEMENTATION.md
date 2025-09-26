# AgentProvision Implementation Documentation

## Overview
AgentProvision is a Full-Stack Developer & DevOps AI Agent that helps automate and streamline the software development process. The system is built using FastAPI, PostgreSQL, and Redis, with a focus on modularity, testability, and scalability.

## Core Components

### 1. Ticket Ingestion & Interpretation Engine
- **Location**: `AgentProvision/core/ticket_engine/`
- **Purpose**: Processes and interprets tickets from various sources (e.g., Jira)
- **Key Features**:
  - Ticket parsing and validation
  - Requirement extraction
  - Status tracking
  - Comment management
- **API Endpoints**: `/tickets/`

### 2. Solution Planning & Strategy Module
- **Location**: `AgentProvision/core/planning/`
- **Purpose**: Creates and manages solution plans for tickets
- **Key Features**:
  - Automatic task creation from requirements
  - Smart task prioritization
  - Effort estimation
  - Dependency management
  - Plan validation
- **API Endpoints**: `/plans/`

## Database Schema

### Tickets
```sql
CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    summary VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Requirements
```sql
CREATE TABLE requirements (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Solution Plans
```sql
CREATE TABLE solution_plans (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    summary TEXT,
    total_estimated_effort INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks
```sql
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    plan_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    estimated_effort INTEGER,
    dependencies VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES solution_plans(id)
);
```

## API Documentation

### Ticket Endpoints

#### Create Ticket
```http
POST /tickets/
Content-Type: application/json

{
    "key": "PROJ-123",
    "fields": {
        "summary": "Implement user authentication",
        "description": "Add JWT-based authentication",
        "issuetype": {"name": "Task"},
        "status": {"name": "To Do"}
    }
}
```

#### Get Ticket
```http
GET /tickets/{ticket_key}
```

#### List Tickets
```http
GET /tickets/
```

### Planning Endpoints

#### Create Solution Plan
```http
POST /plans/tickets/{ticket_id}
```

#### Get Solution Plan
```http
GET /plans/{plan_id}
```

#### Get Ticket Plan
```http
GET /plans/tickets/{ticket_id}
```

#### List Solution Plans
```http
GET /plans/
```

## Development Setup

1. **Prerequisites**:
   - Docker and Docker Compose
   - Python 3.8+
   - PostgreSQL 13+
   - Redis 6+

2. **Environment Variables**:
   Create a `.env` file with:
   ```
   POSTGRES_USER=AgentProvision
   POSTGRES_PASSWORD=AgentProvision
   POSTGRES_DB=AgentProvision
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   REDIS_HOST=redis
   REDIS_PORT=6379
   APP_HOST=0.0.0.0
   APP_PORT=8000
   DEBUG=true
   ENVIRONMENT=development
   PROMETHEUS_MULTIPROC_DIR=/tmp
   ```

3. **Running the Application**:
   ```bash
   # Build and start services
   docker-compose up --build

   # Run tests
   docker-compose run --rm app pytest

   # Access API documentation
   http://localhost:8000/docs
   ```

## Testing

The project follows Test-Driven Development (TDD) principles. Tests are located in the `AgentProvision/tests/` directory:

- `test_ticket_engine.py`: Tests for ticket processing
- `test_planning.py`: Tests for solution planning

Run tests with:
```bash
pytest AgentProvision/tests/
```

## Monitoring

The application includes:
- Prometheus metrics at `/metrics`
- OpenTelemetry tracing
- Health check endpoint at `/health`

## Next Steps

1. Implement Code Generation & Implementation Module
2. Add CI/CD pipeline configuration
3. Enhance monitoring and logging
4. Add user authentication and authorization
5. Implement caching with Redis
