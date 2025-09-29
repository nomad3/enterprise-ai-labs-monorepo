"""
Kubernetes Knowledge Base for agentprovision
Contains troubleshooting guides, best practices, and common solutions
"""

KUBERNETES_TROUBLESHOOTING = {
    "pods": {
        "crashloopbackoff": {
            "symptoms": [
                "Pod status shows CrashLoopBackOff",
                "Container keeps restarting",
            ],
            "common_causes": [
                "Application errors",
                "Resource constraints",
                "Configuration issues",
                "Dependency problems",
                "Database connection failures (e.g., to Cloud SQL - check proxy setup and Workload Identity if used).",
            ],
            "solutions": [
                "Check container logs: kubectl logs <pod-name>",
                "Check previous container logs: kubectl logs <pod-name> --previous",
                "Describe pod for events: kubectl describe pod <pod-name>",
                "Check resource limits and requests",
                "Verify environment variables and configs",
                "If using Cloud SQL Proxy, ensure sidecar is running, KSA is annotated for Workload Identity, and the linked GSA has 'roles/cloudsql.client'.",
            ],
        },
        "pending": {
            "symptoms": ["Pod status shows Pending", "Pod not starting"],
            "common_causes": [
                "Insufficient cluster resources",
                "Node affinity/taint issues",
                "PersistentVolume issues",
                "Scheduler problems",
            ],
            "solutions": [
                "Check node resources: kubectl describe nodes",
                "Check pod events: kubectl describe pod <pod-name>",
                "Verify node affinity and taints",
                "Check PersistentVolume claims",
            ],
        },
    },
    "services": {
        "no_endpoints": {
            "symptoms": ["Service has no endpoints", "Cannot connect to service"],
            "common_causes": [
                "No matching pods",
                "Label selector mismatch",
                "Pod not ready",
            ],
            "solutions": [
                "Check pod labels: kubectl get pods --show-labels",
                "Verify service selector matches pod labels",
                "Check pod readiness",
            ],
        }
    },
    "ingress": {
        "not_routing": {
            "symptoms": ["Ingress not routing traffic", "404 errors"],
            "common_causes": [
                "Ingress controller issues",
                "Backend service problems",
                "TLS configuration issues",
            ],
            "solutions": [
                "Check ingress controller logs",
                "Verify backend services",
                "Check TLS certificates",
                "Verify ingress rules",
            ],
        }
    },
}

KUBERNETES_BEST_PRACTICES = {
    "pods": [
        "Use appropriate resource requests and limits",
        "Implement proper health checks",
        "Use appropriate restart policies",
        "Implement proper logging",
        "Use appropriate security contexts",
        "For connecting to Cloud SQL from GKE, consider using the Cloud SQL Auth Proxy as a sidecar container.",
    ],
    "deployments": [
        "Use rolling updates",
        "Implement proper health checks",
        "Use appropriate update strategy",
        "Implement proper rollback strategy",
    ],
    "services": [
        "Use appropriate service type",
        "Implement proper load balancing",
        "Use appropriate session affinity",
    ],
    "ingress": [
        "Use appropriate ingress controller",
        "Implement proper TLS",
        "Use appropriate path-based routing",
    ],
    "serviceaccounts_and_rbac": [
        "Follow the principle of least privilege.",
        "When using GCP Workload Identity, annotate Kubernetes Service Account (KSA) with 'iam.gke.io/gcp-service-account: GSA_EMAIL' to link to a Google Service Account (GSA).",
        "Ensure the corresponding GSA has 'roles/iam.workloadIdentityUser' for the KSA principal (e.g., 'serviceAccount:PROJECT_ID.svc.id.goog[NAMESPACE/KSA_NAME]').",
    ],
}


def analyze_kubernetes_issue(issue_description: str) -> dict:
    """
    Analyze Kubernetes issue and provide troubleshooting steps
    Returns a dictionary with analysis and recommendations
    """
    # Implementation will use LLM to analyze issues and provide solutions
    pass


def generate_kubernetes_manifest(requirements: dict) -> dict:
    """
    Generate Kubernetes manifest based on requirements
    Returns a dictionary with deployment, service, and ingress manifests
    """
    # Implementation will use LLM to generate manifests based on requirements
    pass
