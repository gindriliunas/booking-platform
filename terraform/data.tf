data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

# Default VPC — matches the current manual deployment in us-east-1.
data "aws_vpc" "default" {
  count   = var.use_default_vpc ? 1 : 0
  default = true
}

data "aws_subnets" "default" {
  count = var.use_default_vpc ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default[0].id]
  }
}

locals {
  vpc_id = var.use_default_vpc ? data.aws_vpc.default[0].id : aws_vpc.main[0].id

  subnet_ids = var.use_default_vpc ? data.aws_subnets.default[0].ids : concat(
    aws_subnet.public[*].id,
    aws_subnet.private[*].id,
  )

  # ALB and Fargate tasks use all subnets in the default VPC (current setup).
  alb_subnet_ids = local.subnet_ids
  ecs_subnet_ids = local.subnet_ids
}
