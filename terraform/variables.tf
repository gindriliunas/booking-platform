variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g. prod, staging)."
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Short name used for resource naming (booking-platform)."
  type        = string
  default     = "booking-platform"
}

variable "domain_name" {
  description = "Public hostname for the app (ACM cert + AUTH_URL)."
  type        = string
  default     = "booking.gindri.com"
}

variable "app_url" {
  description = "Full public URL including scheme (must match browser origin)."
  type        = string
  default     = "https://booking.gindri.com"
}

variable "use_default_vpc" {
  description = "Use the account default VPC (matches current manual setup). Set false to create a dedicated VPC."
  type        = bool
  default     = true
}

variable "vpc_cidr" {
  description = "CIDR for a dedicated VPC when use_default_vpc is false."
  type        = string
  default     = "10.0.0.0/16"
}

variable "container_port" {
  description = "Port the Next.js container listens on (Dockerfile EXPOSE)."
  type        = number
  default     = 3000
}

variable "ecs_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "Fargate task memory (MiB)."
  type        = number
  default     = 1024
}

variable "ecs_desired_count" {
  description = "Number of Fargate tasks behind the ALB."
  type        = number
  default     = 1
}

variable "create_rds" {
  description = "Create RDS PostgreSQL. Set false if you already have a database and will supply DATABASE_URL in Secrets Manager."
  type        = bool
  default     = true
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "booking_platform"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "booking_admin"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GiB)."
  type        = number
  default     = 20
}

variable "db_backup_retention_days" {
  description = "RDS backup retention in days."
  type        = number
  default     = 7
}

variable "github_repository" {
  description = "GitHub repo allowed to assume the deploy role (org/repo)."
  type        = string
  default     = "gindriliunas/booking-platform"
}

variable "github_deploy_branches" {
  description = "Git refs allowed to deploy via OIDC (refs/heads/main, etc.)."
  type        = list(string)
  default     = ["refs/heads/main"]
}

variable "create_github_oidc_provider" {
  description = "Create the GitHub OIDC provider. Set false if it already exists in the account."
  type        = bool
  default     = true
}

variable "github_oidc_provider_arn" {
  description = "Existing GitHub OIDC provider ARN when create_github_oidc_provider is false."
  type        = string
  default     = ""
}

variable "ecr_image_tag" {
  description = "Initial ECR image tag for the ECS task definition."
  type        = string
  default     = "latest"
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention for ECS tasks."
  type        = number
  default     = 30
}
