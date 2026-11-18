variable "aws_region" {
  description = "AWS deployment region (e.g. ap-south-1 for Mumbai)"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "royal-cinema-erp"
}

variable "app_port" {
  description = "Container port for the NestJS API"
  type        = number
  default     = 4000
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "fargate_memory" {
  description = "Fargate instance memory in MB"
  type        = number
  default     = 2048
}
