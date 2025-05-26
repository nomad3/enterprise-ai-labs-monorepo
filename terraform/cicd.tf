# Service Account for CI/CD (GitHub Actions)
resource "google_service_account" "cicd_sa" {
  account_id   = "github-actions-cicd"
  display_name = "GitHub Actions CI/CD Service Account"
  project      = var.gcp_project
}

# Grant GCR push access to the CI/CD SA
resource "google_project_iam_member" "cicd_sa_gcr_admin" {
  project = var.gcp_project
  role    = "roles/storage.admin" # Broad for GCR push, consider scoping down for Artifact Registry
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

# Grant GKE cluster access to the CI/CD SA
resource "google_project_iam_member" "cicd_sa_gke_developer" {
  project = var.gcp_project
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

# (Optional) Allow CI/CD SA to use Workload Identity if it needs to impersonate KSAs
# This is not strictly needed if the SA key is used directly by GitHub Actions,
# but good for consistency if other SAs use WI.
resource "google_project_iam_member" "cicd_sa_workload_identity_user" {
  project = var.gcp_project
  role    = "roles/iam.workloadIdentityUser"
  member  = "serviceAccount:${google_service_account.cicd_sa.email}"
}

output "cicd_service_account_email" {
  description = "The email of the CI/CD service account."
  value       = google_service_account.cicd_sa.email
}

# Workload Identity Federation for GitHub Actions
resource "google_iam_workload_identity_pool" "github_actions_pool" {
  project                   = var.gcp_project
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions WIF Pool"
  description               = "Pool for GitHub Actions CI/CD"
}

resource "google_iam_workload_identity_pool_provider" "github_actions_provider" {
  project                               = var.gcp_project
  workload_identity_pool_id             = google_iam_workload_identity_pool.github_actions_pool.workload_identity_pool_id
  workload_identity_pool_provider_id  = "github-actions-provider"
  display_name                          = "GitHub Actions Provider"
  description                           = "Provider for GitHub Actions OIDC tokens"
  attribute_mapping = {
    "google.subject"       = "assertion.sub",
    "attribute.actor"      = "assertion.actor",
    "attribute.repository" = "assertion.repository"
  }
  attribute_condition = "attribute.repository.startsWith('nomad3/')"
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Allow the CI/CD GSA to be impersonated by GitHub Actions identities from the specific repository
resource "google_service_account_iam_member" "cicd_sa_wif_user" {
  service_account_id = google_service_account.cicd_sa.name # SA to be impersonated
  role                 = "roles/iam.workloadIdentityUser"
  # Change `nomade/thefullstackagent` to your GitHub org/repo
  member               = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_actions_pool.name}/attribute.repository/nomad3/thefullstackagent"
  depends_on = [
    google_iam_workload_identity_pool_provider.github_actions_provider
  ]
} 