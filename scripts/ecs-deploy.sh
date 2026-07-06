#!/usr/bin/env bash
# Register a new ECS task definition with an updated image and roll the service.
set -euo pipefail

CLUSTER="${ECS_CLUSTER:?ECS_CLUSTER required}"
SERVICE="${ECS_SERVICE:?ECS_SERVICE required}"
TASK_FAMILY="${ECS_TASK_FAMILY:?ECS_TASK_FAMILY required}"
IMAGE_URI="${IMAGE_URI:?IMAGE_URI required}"
CONTAINER_NAME="${CONTAINER_NAME:-booking-platform}"

TASK_DEF_JSON="$(aws ecs describe-task-definition \
  --task-definition "$TASK_FAMILY" \
  --query 'taskDefinition' \
  --output json)"

NEW_TASK_DEF_JSON="$(echo "$TASK_DEF_JSON" | jq \
  --arg IMAGE "$IMAGE_URI" \
  --arg NAME "$CONTAINER_NAME" \
  '(.containerDefinitions[] | select(.name == $NAME) | .image) = $IMAGE
   | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')"

NEW_TASK_ARN="$(aws ecs register-task-definition \
  --cli-input-json "$NEW_TASK_DEF_JSON" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)"

echo "Registered task definition: $NEW_TASK_ARN"

aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --task-definition "$NEW_TASK_ARN" \
  --force-new-deployment \
  --query 'service.serviceName' \
  --output text

echo "Waiting for service stability..."
aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICE"
echo "Deployment complete."
