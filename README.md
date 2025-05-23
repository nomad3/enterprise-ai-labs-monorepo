# DevAgent - Full-Stack Developer & DevOps AI Agent

## Overview
DevAgent is an autonomous AI assistant designed to help developers by automating various aspects of the software development lifecycle. It can understand tasks from Jira tickets, design solutions, write code, implement tests, handle version control, create pull requests, and assist with deployment.

## Features (In Progress)
- [ ] Task Ingestion & Understanding
- [ ] Solution Design & Planning
- [ ] Code & Test Generation
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

Current Phase: Initial Setup and Core Architecture Implementation

## Getting Started

### Prerequisites
- Python 3.9+
- Git
- Docker and Docker Compose

### Installation

#### Using Docker (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devagent.git
   cd devagent
   ```

2. Create and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Build and start the services:
   ```bash
   docker-compose up --build
   ```

4. Run tests:
   ```bash
   docker-compose run test
   ```

5. Run linting:
   ```bash
   docker-compose run lint
   ```

#### Manual Installation (Alternative)
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devagent.git
   cd devagent
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development Progress
- [x] Project initialization
- [ ] Core architecture setup
- [ ] Basic task ingestion
- [ ] Solution planning module
- [ ] Code generation integration
- [ ] Test framework implementation
- [ ] Version control integration
- [ ] CI/CD pipeline setup
- [ ] Communication module
- [ ] Documentation

## Contributing
This project is currently in active development. Please refer to our contributing guidelines for more information.

## License
MIT License - See LICENSE file for details 