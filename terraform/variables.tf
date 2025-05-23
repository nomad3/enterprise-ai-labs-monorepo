variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "devagent-cluster"
}

variable "cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.27"
}

variable "db_identifier" {
  description = "Identifier for RDS instance"
  type        = string
  default     = "devagent-db"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "devagent"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "redis_cluster_id" {
  description = "Identifier for Redis cluster"
  type        = string
  default     = "devagent-redis"
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes"
  type        = number
  default     = 1
}

variable "app_assets_bucket_name" {
  description = "Name of the S3 bucket for application assets"
  type        = string
  default     = "devagent-assets"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate"
  type        = string
}

variable "gcp_project" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region to deploy resources (e.g., southamerica-west1)"
  type        = string
  default     = "southamerica-west1"
}

variable "gke_cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
  default     = "devagent-gke"
} 