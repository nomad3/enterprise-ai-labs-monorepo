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

# Terraform commands (assuming execution within the 'terraform' directory)
TF_DIR := terraform

## Initialize Terraform in the terraform directory
tf-init:
	@echo "Initializing Terraform in $(TF_DIR)..."
	terraform -chdir=$(TF_DIR) init

## Generate a Terraform execution plan
tf-plan:
	@echo "Generating Terraform plan in $(TF_DIR)..."
	terraform -chdir=$(TF_DIR) plan

## Apply the Terraform configuration
tf-apply:
	@echo "Applying Terraform configuration in $(TF_DIR)..."
	terraform -chdir=$(TF_DIR) apply -auto-approve

## Destroy Terraform-managed infrastructure
tf-destroy:
	@echo "Destroying Terraform-managed infrastructure in $(TF_DIR)..."
	terraform -chdir=$(TF_DIR) destroy -auto-approve

## Show Terraform outputs (if any defined)
tf-output:
	@echo "Showing Terraform outputs from $(TF_DIR)..."
	terraform -chdir=$(TF_DIR) output 