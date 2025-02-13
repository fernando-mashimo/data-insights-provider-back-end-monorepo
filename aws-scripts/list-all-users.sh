#!/bin/bash

set -e

CREDENTIALS_PROFILE="delta-prod"
USER_POOL_ID="us-east-1_rltdxwuHk"

# List all users in the specified User Pool
aws cognito-idp list-users \
  --user-pool-id $USER_POOL_ID \
  --query 'Users[*].{
    Username: Username,
    Status: UserStatus,
    Email: Attributes[?Name==`email`].Value | [0],
    DashboardsID: Attributes[?Name==`custom:dashboards_id`].Value | [0]
  }' \
  --output table \
  --profile $CREDENTIALS_PROFILE
