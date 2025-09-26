"""
Terraform Knowledge Base for AgentProvision
Contains patterns, best practices, and templates for Terraform code generation
"""

TERRAFORM_PROVIDERS = {
    "gcp": {
        "provider": "google",
        "version": ">= 5.0",
        "required_providers": {
            "google": {"source": "hashicorp/google", "version": ">= 5.0"}
        },
    },
    "aws": {
        "provider": "aws",
        "version": "~> 5.0",
        "required_providers": {"aws": {"source": "hashicorp/aws", "version": "~> 5.0"}},
    },
}

TERRAFORM_MODULES = {
    "gcp": {
        "compute": {
            "gke": {
                "description": "Google Kubernetes Engine cluster",
                "required_vars": ["project_id", "region", "cluster_name"],
                "optional_vars": ["node_count", "machine_type"],
            },
            "cloud_sql": {
                "description": "Cloud SQL instance",
                "required_vars": ["instance_name", "database_version"],
                "optional_vars": ["tier", "disk_size"],
            },
        },
        "storage": {
            "gcs": {
                "description": "Google Cloud Storage bucket",
                "required_vars": ["bucket_name"],
                "optional_vars": ["location", "storage_class"],
            }
        },
    }
}

TERRAFORM_BEST_PRACTICES = [
    "Use modules for reusable infrastructure components",
    "Implement state management (e.g., GCS backend for GCP)",
    "Use variables for configurable values",
    "Implement proper tagging/labeling",
    "Use data sources for existing resources",
    "Implement proper IAM and security controls",
    "Use workspaces for environment separation",
    "Implement proper error handling and validation",
    "GKE: Manage default node pool settings (initial_node_count, node_config) in cluster resource to prevent perpetual diffs.",
    "GKE: For Workload Identity, annotate KSA and grant GSA 'roles/iam.workloadIdentityUser' for KSA principal (e.g., project.svc.id.goog[namespace/ksa-name]).",
    "GKE: Pod SAs using Cloud SQL Proxy need GSA with 'roles/cloudsql.client'.",
    "CI/CD (GitHub Actions WIF to GCP): Define 'attribute_condition' on the OIDC provider resource (google_iam_workload_identity_pool_provider).",
    "CI/CD (GitHub Actions WIF to GCP): Ensure IAM binding for 'roles/iam.workloadIdentityUser' on CI/CD GSA uses a 'member' principalSet matching OIDC token claims (e.g., attribute.repository/OWNER/REPO).",
    "CI/CD (GCR/Artifact Registry): Grant CI/CD GSA 'roles/artifactregistry.writer' and 'roles/artifactregistry.repoAdmin' for image push and repo creation.",
]

TERRAFORM_TEMPLATES = {
    "main": """
terraform {{
  required_providers {{
    {provider_block}
  }}
}}

provider "{provider_name}" {{
  project = var.project_id
  region  = var.region
}}

{resource_blocks}
""",
    "variables": """
variable "project_id" {{
  description = "Project ID"
  type        = string
}}

variable "region" {{
  description = "Region"
  type        = string
  default     = "{default_region}"
}}

{additional_variables}
""",
    "outputs": """
output "{resource_name}_id" {{
  description = "ID of the created resource"
  value       = {resource_reference}
}}
""",
}


def generate_terraform_code(requirements: dict) -> dict:
    """
    Generate Terraform code based on requirements
    Returns a dictionary with main.tf, variables.tf, and outputs.tf
    """
    # Implementation will use LLM to generate code based on requirements
    # and the knowledge base above
    pass


def validate_terraform_code(code: str) -> dict:
    """
    Validate generated Terraform code
    Returns validation results and suggestions
    """
    # Implementation will use terraform validate and custom checks
    pass
