#!/bin/bash

set -e

# Variables
CREDENTIALS_PROFILE="delta-staging"
USER_POOL_ID="us-east-1_oHnCLOriG"
USERNAME="seu email"
USER_ATTRIBUTES='[
  {
    "Name": "custom:dashboards_id",
    "Value": "6,7,8,9"
  }
]'

# Update user attributes
aws cognito-idp admin-update-user-attributes \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --user-attributes "$USER_ATTRIBUTES" \
  --profile $CREDENTIALS_PROFILE

echo "User $USERNAME attributes updated successfully in user pool $USER_POOL_ID."
