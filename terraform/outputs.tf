output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  value = var.aws_region
}

output "vpc_id" {
  value = local.vpc_id
}

output "ecr_repository_url" {
  description = "Push container images here (GitHub Actions or scripts/push-ecr.ps1)."
  value       = aws_ecr_repository.app.repository_url
}

output "alb_dns_name" {
  description = "Point your domain CNAME (booking) at this hostname (GoDaddy)."
  value       = aws_lb.app.dns_name
}

output "alb_zone_id" {
  value = aws_lb.app.zone_id
}

output "app_url" {
  value = var.app_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "ecs_task_definition_family" {
  value = aws_ecs_task_definition.app.family
}

output "github_deploy_role_arn" {
  description = "Set as GitHub repository variable AWS_DEPLOY_ROLE_ARN."
  value       = aws_iam_role.github_deploy.arn
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.app.arn
}

output "acm_dns_validation_records" {
  description = "Create these CNAME records at your DNS provider before HTTPS will work."
  value = {
    for dvo in aws_acm_certificate.app.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}

output "rds_endpoint" {
  description = "RDS hostname (null when create_rds = false)."
  value       = var.create_rds ? aws_db_instance.main[0].address : null
}

output "secrets" {
  description = "Populate Cognito and optional integration values in Secrets Manager after first apply."
  value = {
    database     = aws_secretsmanager_secret.database.name
    auth         = aws_secretsmanager_secret.auth.name
    cognito      = aws_secretsmanager_secret.cognito.name
    integrations = aws_secretsmanager_secret.integrations.name
  }
}

output "dns_setup_checklist" {
  description = "Manual DNS steps when using GoDaddy (not Route 53)."
  value       = <<-EOT
    1. ACM validation: add CNAME from acm_dns_validation_records output.
    2. App traffic: CNAME host "booking" -> ${aws_lb.app.dns_name}
    3. Cognito callbacks: ${var.app_url}/api/auth/callback/cognito (and cognito-signup)
  EOT
}
