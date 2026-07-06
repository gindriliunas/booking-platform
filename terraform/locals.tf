locals {
  name_prefix = var.project_name

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
  }

  # Non-secret runtime env vars injected into the ECS task.
  app_environment = [
    { name = "NODE_ENV", value = "production" },
    { name = "PORT", value = tostring(var.container_port) },
    { name = "HOSTNAME", value = "0.0.0.0" },
    { name = "AUTH_URL", value = var.app_url },
    { name = "NEXT_PUBLIC_APP_URL", value = var.app_url },
  ]

  # Secrets pulled from Secrets Manager at task startup.
  app_secrets = concat(
    [
      {
        name      = "DATABASE_URL"
        valueFrom = "${aws_secretsmanager_secret.database.arn}:DATABASE_URL::"
      },
      {
        name      = "AUTH_SECRET"
        valueFrom = "${aws_secretsmanager_secret.auth.arn}:AUTH_SECRET::"
      },
      {
        name      = "CRON_SECRET"
        valueFrom = "${aws_secretsmanager_secret.auth.arn}:CRON_SECRET::"
      },
    ],
    [
      for key in ["AUTH_COGNITO_ID", "AUTH_COGNITO_SECRET", "AUTH_COGNITO_ISSUER", "COGNITO_DOMAIN"] : {
        name      = key
        valueFrom = "${aws_secretsmanager_secret.cognito.arn}:${key}::"
      }
    ],
    [
      {
        name      = "RESEND_API_KEY"
        valueFrom = "${aws_secretsmanager_secret.integrations.arn}:RESEND_API_KEY::"
      },
    ],
  )
}
