terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ─── VPC & NETWORKING ─────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

# ─── S3 ASSETS BUCKET & CLOUDFRONT CDN ────────────────────
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-assets-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "assets_block" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── AWS SQS (ASYNCHRONOUS BACKGROUND JOBS) ───────────────
resource "aws_sqs_queue" "jobs_queue" {
  name                      = "${var.project_name}-jobs-queue"
  message_retention_seconds = 86400 # 1 day
}

# ─── AWS COGNITO USER POOL ────────────────────────────────
resource "aws_cognito_user_pool" "pool" {
  name = "${var.project_name}-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    attribute_data_type = "String"
    name                = "tenantId"
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "role"
    mutable             = true
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "${var.project_name}-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

# ─── AWS ECS FARGATE CLUSTER ──────────────────────────────
resource "aws_ecs_cluster" "cluster" {
  name = "${var.project_name}-cluster"
}

# ─── CLOUDWATCH LOG GROUP ─────────────────────────────────
resource "aws_cloudwatch_log_group" "logs" {
  name              = "/ecs/${var.project_name}-api"
  retention_in_days = 30
}

# ─── APPLICATION LOAD BALANCER (ALB) ──────────────────────
resource "aws_lb" "alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}
