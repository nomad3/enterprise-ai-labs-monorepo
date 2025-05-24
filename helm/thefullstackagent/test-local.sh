#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Testing DevAgent Helm chart in local Rancher...${NC}"

# Create namespace if it doesn't exist
kubectl create namespace devagent --dry-run=client -o yaml | kubectl apply -f -

# Package the chart
echo -e "${YELLOW}Packaging Helm chart...${NC}"
helm package .

# Install/upgrade the chart
echo -e "${YELLOW}Installing/upgrading DevAgent...${NC}"
helm upgrade --install devagent ./devagent-0.1.0.tgz \
  --namespace devagent \
  -f values-local.yaml \
  --wait

# Verify the deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
kubectl rollout status deployment/devagent -n devagent

# Show resources
echo -e "${GREEN}Deployment successful! Showing resources:${NC}"
kubectl get all -n devagent

# Show ingress
echo -e "${GREEN}Ingress details:${NC}"
kubectl get ingress -n devagent

# Show logs
echo -e "${GREEN}Pod logs:${NC}"
kubectl logs -n devagent -l app.kubernetes.io/name=devagent --tail=50

echo -e "${GREEN}Test completed!${NC}"
echo -e "To access the application, add 'devagent.local' to your /etc/hosts file pointing to your Rancher IP" 