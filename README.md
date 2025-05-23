# DevAgent - Full-Stack Developer & DevOps AI Agent

A comprehensive development platform that combines AI-powered code generation, testing, version control, and CI/CD capabilities.

## Features

### Authentication & User Management
- Secure user authentication
- Role-based access control
- User profile management

### Ticket Management
- Create and track development tickets
- Assign tickets to team members
- Track ticket status and progress
- Filter and search tickets

### Code Generation
- AI-powered code generation
- Multiple language support
- Code completion and suggestions
- Code review and optimization

### Test Generation
- Automated test case generation
- Unit test creation
- Integration test support
- Test coverage analysis

### Version Control
- Git integration
- Branch management
- Commit history
- Change tracking
- Push/Pull operations

### CI/CD Pipeline Management
- Pipeline creation and configuration
- Stage management
- Build and deployment tracking
- Pipeline status monitoring
- Log viewing and analysis

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

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/devagent.git
cd devagent
```

2. Install dependencies:
```bash
# Frontend
cd devagent-ui
npm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/devagent
SECRET_KEY=your-secret-key
```

4. Start the development servers:
```bash
# Frontend
cd devagent-ui
npm run dev

# Backend
cd ../backend
uvicorn main:app --reload
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
devagent/
├── devagent-ui/           # Frontend application
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts
│   │   │   ├── services/    # API services
│   │   │   └── styles/      # Global styles
│   │   └── public/       # Static assets
│   └── package.json
│
└── backend/              # Backend application
    ├── app/
    │   ├── api/         # API endpoints
    │   ├── core/        # Core functionality
    │   ├── models/      # Database models
    │   └── services/    # Business logic
    └── requirements.txt
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
- [ ] Solution Design & Planning
- [ ] Code & Test Generation (API endpoint for code generation via Gemini 2.5)
- [ ] Version Control Integration
- [ ] Pull Request Management
- [ ] Deployment Assistance
- [ ] Post-Deployment Monitoring

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

## Technology Stack
- **Backend**: Python with FastAPI
- **LLM Integration**: Gemini 2.5 API
- **Testing**: pytest
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Documentation**: Sphinx

## Project Status
🚧 **Under Development** 🚧

Current Phase: Core API, Monitoring, and Infrastructure Setup Complete

## What's Next
- **Code Generation & Refinement Core**: Integrate Gemini 2.5 API for code generation and refinement.
- **Test Generation & Execution Framework**: Implement TDD practices, generate and run tests automatically.
- **Troubleshooting Capabilities**: Add automated troubleshooting and debugging tools.
- **Solution Planning Module**: Finalize and expand the planning/strategy engine.
- **Version Control & CI/CD**: Integrate Git operations and CI/CD pipeline.

## Development Progress
- [x] Project initialization
- [x] Core architecture setup (API, Docker, Monitoring, Health Checks)
- [x] Basic task ingestion (Ticket endpoints)
- [x] Monitoring & Observability (Prometheus, Grafana, OpenTelemetry)
- [x] Database & Caching (PostgreSQL, Redis, PgAdmin)
- [ ] Solution planning module
- [ ] Code generation integration
- [ ] Test framework implementation
- [ ] Version control integration
- [ ] CI/CD pipeline setup
- [ ] Communication module
- [ ] Documentation

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