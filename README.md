# DevAgent - Full-Stack Developer & DevOps AI Agent

A comprehensive development platform that combines AI-powered code generation, testing, version control, and CI/CD capabilities with advanced DevOps and cloud architecture features.

## Features

### Authentication & User Management
- Secure user authentication with JWT
- Role-based access control
- User profile management
- Session management

### Ticket Management
- Create and track development tickets
- Assign tickets to team members
- Track ticket status and progress
- Filter and search tickets
- Automated ticket analysis and requirement extraction

### Code Generation
- AI-powered code generation using Gemini 2.5
- Multiple language support
- Code completion and suggestions
- Code review and optimization
- Architecture pattern recommendations

### Test Generation
- Automated test case generation
- Unit test creation
- Integration test support
- Test coverage analysis
- Performance test generation

### Version Control
- Git integration
- Branch management
- Commit history
- Change tracking
- Push/Pull operations
- Automated conflict resolution

### CI/CD Pipeline Management
- Pipeline creation and configuration
- Stage management
- Build and deployment tracking
- Pipeline status monitoring
- Log viewing and analysis
- Automated rollback capabilities

### DevOps & Cloud Architecture
- Infrastructure as Code (Terraform) for GCP
- Kubernetes orchestration on Google Kubernetes Engine (GKE)
- Helm charts for application deployment to GKE
- Automated CI/CD pipeline using GitHub Actions for GKE deployments
- Cloud-native architecture design
- Multi-cloud support (initially focused on GCP)
- Automated scaling and load balancing (via Kubernetes HPA, GKE features)

### Monitoring & Observability
- Real-time metrics collection with Prometheus
- Customizable dashboards with Grafana
- Distributed tracing
- Log aggregation and analysis
- Performance monitoring
- Resource utilization tracking

### Alerting & Incident Management
- Custom alert rules
- Multi-channel notifications
- Incident tracking
- Root cause analysis
- Post-mortem documentation
- Automated incident response

## Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- CSS Modules

### Backend
- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Redis

### DevOps & Cloud
- Docker & Docker Compose (for local development)
- Google Cloud Platform (GCP)
  - Google Kubernetes Engine (GKE)
  - Google Container Registry (GCR)
  - Cloud SQL (PostgreSQL)
  - Memorystore (Redis)
- Terraform (for GCP infrastructure)
- Kubernetes
- Helm
- GitHub Actions (for CI/CD)
- Prometheus
- Grafana
- Node Exporter
- cAdvisor
- AlertManager

## Getting Started

### Local Development (Docker Compose)

1. Clone the repository:
   ```bash
   git clone https://github.com/nomad3/thefullstackagent.git
   cd thefullstackagent
   ```

2. Start the development environment:
   ```bash
   docker-compose up -d
   ```

3. Access the services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090
   - PgAdmin: http://localhost:5050 (admin@devagent.com/admin)

### GCP / Google Kubernetes Engine (GKE) Deployment

This project is configured for automated deployment to Google Kubernetes Engine (GKE) using Terraform for infrastructure provisioning and GitHub Actions for CI/CD (building Docker images, pushing to GCR, and deploying Helm charts).

Key components of the GCP deployment:
- **Terraform:** Manages all GCP resources including GKE, Cloud SQL, Memorystore, GCS, and IAM (see `terraform/` directory).
- **GitHub Actions:** Orchestrates the CI/CD pipeline (see `.github/workflows/gcp-deploy.yml`).
- **Helm:** Packages and deploys the application to GKE (see `helm/thefullstackagent/` and `helm/thefullstackagent/values-gcp.yaml`).
- **Workload Identity:** Used for secure authentication between GitHub Actions & GCP, and between GKE pods & GCP services.

For a detailed summary of the DevOps setup, configurations, and key learnings, please refer to the [DevOps Summary Document](devagent/core/knowledge/devops_summary.md).

## Project Structure

```
thefullstackagent/
├── .github/
│   └── workflows/
│       ├── gcp-deploy.yml         # GitHub Actions CI/CD workflow for GCP
│       └── *.disabled             # Disabled/old workflow files
├── devagent/                      # Backend Python/FastAPI application
│   ├── Dockerfile                 # Dockerfile for the backend API
│   ├── requirements.txt           # Python dependencies
│   ├── api/                       # API endpoint definitions (routers)
│   ├── core/                      # Core backend logic
│   │   ├── knowledge/             # Agent's knowledge base (DevOps, Terraform, etc.)
│   │   │   └── devops_summary.md  # Detailed DevOps setup documentation
│   │   ├── services/              # Business logic services
│   │   ├── code_gen/              # Code generation modules
│   │   ├── ticket_engine/         # Ticket processing logic
│   │   ├── planning/              # Task planning modules
│   │   ├── version_control/       # Git integration
│   │   ├── models/                # Pydantic models / SQLAlchemy models
│   │   ├── config.py              # Application configuration
│   │   ├── database.py            # Database setup and session management
│   │   └── ...                    # Other core components
│   ├── tests/                     # Backend tests
│   └── utils/                     # Utility functions
├── devagent-ui/                   # Frontend Next.js application
│   ├── Dockerfile                 # Dockerfile for the frontend UI
│   ├── package.json               # Node.js dependencies
│   ├── src/                       # Frontend source code
│   │   ├── app/                   # Next.js app directory (pages, components)
│   │   ├── components/            # Reusable React components
│   │   ├── contexts/              # React contexts
│   │   ├── services/              # API client services
│   │   └── styles/                # CSS styles
│   ├── public/                    # Static assets
│   └── next.config.js             # Next.js configuration
├── helm/                          # Helm charts
│   └── thefullstackagent/         # Main application Helm chart
│       ├── Chart.yaml             # Helm chart definition
│       ├── values.yaml            # Default Helm values
│       ├── values-gcp.yaml        # GCP-specific Helm values
│       ├── values-local.yaml      # Local development Helm values
│       ├── templates/             # Kubernetes manifest templates
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   ├── ingress.yaml
│       │   ├── secret.yaml
│       │   ├── configmap.yaml
│       │   ├── serviceaccount.yaml
│       │   └── _helpers.tpl       # Helm helper templates
│       └── charts/                # Subcharts (e.g., postgresql, redis if not disabled)
├── terraform/                     # Infrastructure as Code (IaC) for GCP
│   ├── main.tf                    # Main Terraform configuration (GKE, SQL, Redis, etc.)
│   ├── variables.tf               # Input variables
│   ├── outputs.tf                 # Output values (e.g., cluster name, DB connection)
│   ├── cicd.tf                    # Terraform for CI/CD service account & WIF
│   └── terraform.tfstate          # Terraform state file (managed remotely in GCS ideally)
├── monitoring/                    # Local monitoring setup (Prometheus, Grafana)
│   ├── prometheus/
│   └── grafana/
├── scripts/                       # Utility scripts
├── Dockerfile                     # Root Dockerfile (if any, seems services have their own)
├── docker-compose.yml             # Docker Compose for local development environment
├── Makefile                       # Makefile for common tasks (lint, test, tf-* etc.)
├── README.md                      # This file
└── ...                            # Other configuration files (.gitignore, etc.)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Overview
DevAgent is an autonomous AI assistant designed to help developers by automating various aspects of the software development lifecycle. It can understand tasks from Jira tickets, design solutions, write code, implement tests, handle version control, create pull requests, and assist with deployment.

## Features (In Progress)
- [x] Task Ingestion & Understanding (API endpoints for ticket management)
- [x] Monitoring & Observability (Prometheus, Grafana, OpenTelemetry integration)
- [x] Health Checks (API health endpoint)
- [x] Dockerized Development Environment
- [x] Database & Caching (PostgreSQL, Redis, PgAdmin)
- [x] CI/CD Pipeline Setup (GitHub Actions for GKE, including Docker build/push & Helm deploy)
- [x] Deployment Assistance (Terraform for infra, Helm for app, automated via CI/CD)
- [ ] Solution Design & Planning
- [ ] Code & Test Generation (API endpoint for code generation via Gemini 2.5)
- [ ] Version Control Integration (beyond basic commits, e.g., automated PRs)
- [ ] Pull Request Management
- [ ] Post-Deployment Monitoring (advanced, beyond basic Prometheus setup)

## Architecture
DevAgent follows a modular architecture with the following key components:

### Core Components
1. **Ticket Ingestion & Interpretation Engine**
   - Processes Jira tickets and other task inputs
   - Extracts requirements and context

2. **Solution Planning & Strategy Module**
   - Breaks down tasks into actionable steps
   - Designs solution architecture

3. **Code Generation & Refinement Core**
   - Interfaces with Gemini 2.5 API
   - Generates and refines code

4. **Test Generation & Execution Framework**
   - Implements TDD practices
   - Generates and runs tests

5. **Version Control Integration**
   - Manages Git operations
   - Handles branching and commits

6. **CI/CD Pipeline Integration**
   - Interfaces with deployment systems
   - Manages build and deployment processes

7. **Communication & Notification Module**
   - Handles Slack/Teams integration
   - Manages Jira updates

## Project Status
🚧 **Under Development** 🚧

Current Phase: Core API, Monitoring, Infrastructure, and CI/CD for GKE Deployment Setup Complete.

## What's Next
- **Code Generation & Refinement Core**: Integrate Gemini 2.5 API for code generation and refinement.
- **Test Generation & Execution Framework**: Implement TDD practices, generate and run tests automatically. Integrate these into the CI/CD pipeline.
- **Troubleshooting Capabilities**: Add automated troubleshooting and debugging tools.
- **Solution Planning Module**: Finalize and expand the planning/strategy engine.
- **Advanced Version Control & PR Management**: Automate more Git operations and PR workflows.
- **Communication module**
- **Comprehensive Documentation** (beyond current DevOps summary)

## Development Progress
- [x] Project initialization
- [x] Core architecture setup (API, Docker, Monitoring, Health Checks)
- [x] Basic task ingestion (Ticket endpoints)
- [x] Monitoring & Observability (Prometheus, Grafana, OpenTelemetry)
- [x] Database & Caching (PostgreSQL, Redis, PgAdmin)
- [x] Infrastructure as Code for GCP (Terraform for GKE, SQL, Redis, etc.)
- [x] CI/CD pipeline setup for GKE (GitHub Actions: Docker build/push, Helm deploy, Workload Identity)
- [ ] Solution planning module
- [ ] Code generation integration
- [ ] Test framework implementation & CI integration
- [ ] Advanced version control integration
- [ ] Communication module
- [ ] Comprehensive end-user and developer documentation (beyond current DevOps summary)

## API Endpoints

### Code Generation
- **POST /code/generate**
    - Request body: `{ "prompt": "Describe the code you want generated" }`
    - Response: `{ "code": "<generated code>" }`
    - Description: Generates code using Gemini 2.5 API based on the provided prompt.

### Test Generation
- **POST /code/generate-tests**
    - Request body: `{ "code": "<code to generate tests for>" }`
    - Response: `{ "tests": "<generated tests>" }`
    - Description: Generates unit tests for the provided code using Gemini 2.5 API.

### Troubleshooting
- **POST /code/troubleshoot**
    - Request body: `{ "code": "<code to troubleshoot>", "error": "<error message>" }`
    - Response: `{ "solution": "<troubleshooting solution>" }`
    - Description: Troubleshoots the provided code based on the given error message using Gemini 2.5 API.

## UI Development

- **Next.js Frontend**: A new Next.js project (`devagent-ui`) has been scaffolded and integrated into the Docker Compose setup. It will run on port 3000 and interact with the FastAPI backend.
- **UI Workflow**: The UI will guide developers through the full TDD loop:
  - Code Generation: Submit a prompt to generate code.
  - Test Generation: Submit code to generate tests.
  - Test Execution: Run the generated tests and view results.
  - Troubleshooting: If tests fail, submit code and error details for troubleshooting.
- **Future Enhancements**:
  - Display commit history and repository progress.
  - Add interactive feedback and real-time updates.
  - Integrate with version control and CI/CD pipelines.

## Version Control Integration

DevAgent now supports basic git operations with ticket number integration:

- **POST /git/init**: Initialize a git repository.
- **POST /git/branch**: Create a new branch with a custom name.
- **POST /git/branch-with-ticket**: Create a new branch with a ticket number and description (e.g., `ticket-123-feature-name`).
- **POST /git/commit**: Commit changes with a custom message.
- **POST /git/commit-with-ticket**: Commit changes with a ticket number in the message (e.g., `[Ticket #123] Your commit message`).
- **POST /git/push**: Push changes to a remote repository.

### Example Usage

- **Creating a branch with a ticket number:**
  ```bash
  curl -X POST "http://localhost:8000/git/branch-with-ticket" -H "Content-Type: application/json" -d '{"ticket_number": "123", "description": "feature-name"}'
  ```

- **Committing with a ticket number:**
  ```bash
  curl -X POST "http://localhost:8000/git/commit-with-ticket" -H "Content-Type: application/json" -d '{"ticket_number": "123", "message": "Implement feature X"}'
  ``` 