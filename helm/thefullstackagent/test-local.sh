#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Testing AgentProvision Helm chart in local Rancher...${NC}"

# Create namespace if it doesn't exist
kubectl create namespace AgentProvision --dry-run=client -o yaml | kubectl apply -f -

# Package the chart
echo -e "${YELLOW}Packaging Helm chart...${NC}"
helm package .

# Install/upgrade the chart
echo -e "${YELLOW}Installing/upgrading AgentProvision...${NC}"
helm upgrade --install AgentProvision ./AgentProvision-0.1.0.tgz \
  --namespace AgentProvision \
  -f values-local.yaml \
  --wait

# Verify the deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
kubectl rollout status deployment/AgentProvision -n AgentProvision

# Show resources
echo -e "${GREEN}Deployment successful! Showing resources:${NC}"
kubectl get all -n AgentProvision

# Show ingress
echo -e "${GREEN}Ingress details:${NC}"
kubectl get ingress -n AgentProvision

# Show logs
echo -e "${GREEN}Pod logs:${NC}"
kubectl logs -n AgentProvision -l app.kubernetes.io/name=AgentProvision --tail=50

echo -e "${GREEN}Test completed!${NC}"
echo -e "To access the application, add 'AgentProvision.local' to your /etc/hosts file pointing to your Rancher IP"
