resource "aws_acm_certificate" "app" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-cert"
  }
}

resource "aws_acm_certificate_validation" "app" {
  certificate_arn = aws_acm_certificate.app.arn

  # Validation completes once DNS records propagate. If using external DNS (GoDaddy),
  # run `terraform apply` again after adding the CNAME records.
  validation_record_fqdns = [
    for dvo in aws_acm_certificate.app.domain_validation_options : dvo.resource_record_name
  ]

  timeouts {
    create = "45m"
  }
}
