terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# VPC Network
resource "google_compute_network" "vpc_network" {
  name = "AgentProvision-vpc"
  auto_create_subnetworks = true
}

# Firewall rule to allow HTTP and HTTPS traffic to the GKE cluster
resource "google_compute_firewall" "allow_http_https" {
  name    = "AgentProvision-vpc-allow-http-https"
  network = google_compute_network.vpc_network.name
  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["gke-${var.gke_cluster_name}"]
}

# GKE Cluster
resource "google_container_cluster" "gke" {
  name     = var.gke_cluster_name
  location = var.gcp_region
  network  = google_compute_network.vpc_network.name
  remove_default_node_pool = true
  initial_node_count = 1

  addons_config {
    http_load_balancing {
      disabled = false
    }
  }

  workload_identity_config {
    workload_pool = "${var.gcp_project}.svc.id.goog"
  }

  # Attempt to influence the disk size of the initial (to be removed) node pool
  node_config {
    machine_type = "e2-small"
    disk_size_gb = 30
    tags = ["gke-${var.gke_cluster_name}"]
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  cluster    = google_container_cluster.gke.name
  location   = var.gcp_region
  node_count = 1

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 30
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    tags = ["gke-${var.gke_cluster_name}"]
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
  }
}

# Cloud SQL (Postgres)
resource "google_sql_database_instance" "postgres" {
  name             = "AgentProvision-postgres"
  database_version = "POSTGRES_15"
  region           = var.gcp_region
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
  }
}

resource "google_sql_database" "AgentProvision" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "postgres" {
  name     = var.db_username
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Memorystore (Redis)
resource "google_redis_instance" "redis" {
  name           = "AgentProvision-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.gcp_region
}

# GCS Bucket for Application Assets
resource "google_storage_bucket" "app_assets" {
  name     = var.app_assets_bucket_name
  location = var.gcp_region
  force_destroy = true
}

# (Optional) Cloud DNS and SSL can be added here as needed

# Service Account for GKE Deployments
resource "google_service_account" "gke_deploy_sa" {
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
  project      = var.gcp_project
}

# IAM binding for GKE cluster access (developer role)
resource "google_project_iam_member" "gke_deploy_sa_container_developer" {
  project = var.gcp_project
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.gke_deploy_sa.email}"
}

# IAM binding for GCR/Artifact Registry access (if pushing images)
resource "google_project_iam_member" "gke_deploy_sa_storage_admin" {
  project = var.gcp_project
  role    = "roles/storage.objectAdmin" # Broad role, consider roles/artifactregistry.writer if only using Artifact Registry
  member  = "serviceAccount:${google_service_account.gke_deploy_sa.email}"
}

# IAM binding for Cloud SQL client access
resource "google_project_iam_member" "gke_deploy_sa_cloudsql_client" {
  project = var.gcp_project
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.gke_deploy_sa.email}"
}

# Global Static IP Address for Ingress
resource "google_compute_global_address" "AgentProvision_static_ip" {
  name         = "AgentProvision-static-ip"
  project      = var.gcp_project
  address_type = "EXTERNAL"
}

# Cloud DNS 'A' Record for agents.datamatic.app
resource "google_dns_record_set" "agents_datamatic_app" {
  name         = "agents.datamatic.app."
  type         = "A"
  ttl          = 300
  managed_zone = var.dns_zone_name
  project      = var.gcp_project # Specify the project for the DNS zone
  rrdatas      = [google_compute_global_address.AgentProvision_static_ip.address]
}
