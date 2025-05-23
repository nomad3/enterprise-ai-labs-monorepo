.PHONY: build up down test lint clean

# Build the Docker images
build:
	docker-compose build

# Start the services
up:
	docker-compose up

# Start the services in detached mode
up-d:
	docker-compose up -d

# Stop the services
down:
	docker-compose down

# Run tests
test:
	docker-compose run test

# Run linting
lint:
	docker-compose run lint

# Clean up Docker resources
clean:
	docker-compose down -v
	docker system prune -f

# Show logs
logs:
	docker-compose logs -f

# Restart services
restart:
	docker-compose restart

# Create a new branch for development
new-branch:
	@read -p "Enter branch name: " branch_name; \
	git checkout -b $$branch_name

# Help command
help:
	@echo "Available commands:"
	@echo "  make build      - Build Docker images"
	@echo "  make up        - Start services"
	@echo "  make up-d      - Start services in detached mode"
	@echo "  make down      - Stop services"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linting"
	@echo "  make clean     - Clean up Docker resources"
	@echo "  make logs      - Show logs"
	@echo "  make restart   - Restart services"
	@echo "  make new-branch - Create a new development branch" 