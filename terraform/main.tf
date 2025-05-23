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
  name = "devagent-vpc"
  auto_create_subnetworks = true
}

# GKE Cluster
resource "google_container_cluster" "gke" {
  name     = var.gke_cluster_name
  location = var.gcp_region
  network  = google_compute_network.vpc_network.name
  remove_default_node_pool = true
  initial_node_count = 1
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  cluster    = google_container_cluster.gke.name
  location   = var.gcp_region
  node_count = 3

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# Cloud SQL (Postgres)
resource "google_sql_database_instance" "postgres" {
  name             = "devagent-postgres"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier = "db-f1-micro"
  }
}

resource "google_sql_database" "devagent" {
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
  name           = "devagent-redis"
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