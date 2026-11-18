output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.alb.dns_name
}

output "s3_bucket_name" {
  description = "S3 bucket for ticket passes & posters"
  value       = aws_s3_bucket.assets.id
}

output "cognito_user_pool_id" {
  description = "AWS Cognito User Pool ID"
  value       = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  description = "AWS Cognito App Client ID"
  value       = aws_cognito_user_pool_client.client.id
}

output "sqs_queue_url" {
  description = "AWS SQS Queue URL for background jobs"
  value       = aws_sqs_queue.jobs_queue.id
}
