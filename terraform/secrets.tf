resource "random_password" "db" {
  count = var.create_rds ? 1 : 0

  length  = 32
  special = false
}

resource "random_password" "auth_secret" {
  length  = 32
  special = false
}

resource "random_password" "cron_secret" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "database" {
  name                    = "${var.project_name}/${var.environment}/database"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "auth" {
  name                    = "${var.project_name}/${var.environment}/auth"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "cognito" {
  name                    = "${var.project_name}/${var.environment}/cognito"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "integrations" {
  name                    = "${var.project_name}/${var.environment}/integrations"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "database" {
  count = var.create_rds ? 1 : 0

  secret_id = aws_secretsmanager_secret.database.id

  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${var.db_username}:${random_password.db[0].result}@${aws_db_instance.main[0].address}:${aws_db_instance.main[0].port}/${var.db_name}?sslmode=require"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret_version" "database_placeholder" {
  count = var.create_rds ? 0 : 1

  secret_id = aws_secretsmanager_secret.database.id

  secret_string = jsonencode({
    DATABASE_URL = "REPLACE_ME_postgresql://user:pass@host:5432/booking_platform?sslmode=require"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret_version" "auth" {
  secret_id = aws_secretsmanager_secret.auth.id

  secret_string = jsonencode({
    AUTH_SECRET  = random_password.auth_secret.result
    CRON_SECRET  = random_password.cron_secret.result
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret_version" "cognito" {
  secret_id = aws_secretsmanager_secret.cognito.id

  secret_string = jsonencode({
    AUTH_COGNITO_ID     = "REPLACE_ME"
    AUTH_COGNITO_SECRET = "REPLACE_ME"
    AUTH_COGNITO_ISSUER = "REPLACE_ME"
    COGNITO_DOMAIN      = "REPLACE_ME"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "aws_secretsmanager_secret_version" "integrations" {
  secret_id = aws_secretsmanager_secret.integrations.id

  secret_string = jsonencode({
    RESEND_API_KEY = ""
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
