output "gke_cluster_name" {
  description = "The name of the GKE cluster."
  value       = google_container_cluster.gke.name
}

output "gke_cluster_endpoint" {
  description = "The endpoint for the GKE cluster."
  value       = google_container_cluster.gke.endpoint
  sensitive   = true 
}

output "gke_cluster_ca_certificate" {
  description = "The CA certificate for the GKE cluster."
  value       = google_container_cluster.gke.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "cloudsql_instance_connection_name" {
  description = "The connection name of the Cloud SQL instance."
  value       = google_sql_database_instance.postgres.connection_name
}

output "redis_host" {
  description = "The host of the Redis instance."
  value       = google_redis_instance.redis.host
}

output "redis_port" {
  description = "The port of the Redis instance."
  value       = google_redis_instance.redis.port
}

output "gke_deploy_service_account_email" {
  description = "The email of the GKE deployment service account."
  value       = google_service_account.gke_deploy_sa.email
}

output "app_assets_bucket_name" {
  description = "The name of the GCS bucket for application assets."
  value       = google_storage_bucket.app_assets.name
} 