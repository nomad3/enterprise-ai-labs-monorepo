#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check required tools
check_requirements() {
    print_status "Checking requirements..."

    # Check gcloud
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud is not installed"
        exit 1
    fi

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi

    # Check helm
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi

    # Check terraform
    if ! command -v terraform &> /dev/null; then
        print_error "terraform is not installed"
        exit 1
    fi
}

# Initialize and apply Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."

    cd terraform

    # Initialize Terraform
    terraform init

    # Plan changes
    terraform plan -out=tfplan

    # Apply changes
    terraform apply tfplan

    # Get outputs
    export GKE_CLUSTER_NAME=$(terraform output -raw gke_cluster_name)
    export GKE_ZONE=$(terraform output -raw gke_zone)
    export PROJECT_ID=$(terraform output -raw project_id)

    cd ..
}

# Configure kubectl
setup_kubectl() {
    print_status "Configuring kubectl..."

    gcloud container clusters get-credentials $GKE_CLUSTER_NAME \
        --zone $GKE_ZONE \
        --project $PROJECT_ID
}

# Install monitoring stack
install_monitoring() {
    print_status "Installing monitoring stack..."

    # Add Prometheus Helm repo
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update

    # Install Prometheus
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --values monitoring/prometheus/values.yaml

    # Install AlertManager
    helm upgrade --install alertmanager prometheus-community/alertmanager \
        --namespace monitoring \
        --values monitoring/alertmanager/values.yaml

    # Install Grafana
    helm upgrade --install grafana grafana/grafana \
        --namespace monitoring \
        --values monitoring/grafana/values.yaml
}

# Deploy AgentProvision
deploy_AgentProvision() {
    print_status "Deploying AgentProvision..."

    # Create namespace
    kubectl create namespace AgentProvision --dry-run=client -o yaml | kubectl apply -f -

    # Create secrets
    kubectl apply -f kubernetes/secrets.yaml -n AgentProvision

    # Deploy AgentProvision
    helm upgrade --install AgentProvision ./helm/AgentProvision \
        --namespace AgentProvision \
        --values kubernetes/values.yaml
}

# Main deployment process
main() {
    print_status "Starting AgentProvision deployment..."

    # Check requirements
    check_requirements

    # Deploy infrastructure
    deploy_infrastructure

    # Setup kubectl
    setup_kubectl

    # Install monitoring
    install_monitoring

    # Deploy AgentProvision
    deploy_AgentProvision

    print_status "Deployment completed successfully!"

    # Print access information
    echo -e "\n${GREEN}Access Information:${NC}"
    echo "GKE Cluster: $GKE_CLUSTER_NAME"
    echo "Project ID: $PROJECT_ID"
    echo "Zone: $GKE_ZONE"

    # Get service URLs
    echo -e "\n${GREEN}Service URLs:${NC}"
    echo "AgentProvision UI: $(kubectl get ingress -n AgentProvision AgentProvision -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
    echo "Grafana: $(kubectl get ingress -n monitoring grafana -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
}

# Run main function
main
