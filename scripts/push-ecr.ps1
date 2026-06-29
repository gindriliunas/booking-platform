# Build and push the container image to ECR.
# Prerequisites: Docker Desktop running, AWS CLI configured (aws configure).
#
# Usage:
#   .\scripts\push-ecr.ps1
#   .\scripts\push-ecr.ps1 -Tag v1

param(
  [string]$Region = "us-east-1",
  [string]$AccountId = "631026310596",
  [string]$Repository = "booking-platform",
  [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"
$Registry = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$ImageUri = "$Registry/${Repository}:$Tag"

Write-Host "Logging in to ECR ($Registry)..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $Registry

Write-Host "Building image..."
docker build -t "${Repository}:$Tag" .

Write-Host "Tagging $ImageUri ..."
docker tag "${Repository}:$Tag" $ImageUri

Write-Host "Pushing $ImageUri ..."
docker push $ImageUri

Write-Host "Done. Use this image URI in your ECS task definition:"
Write-Host $ImageUri
