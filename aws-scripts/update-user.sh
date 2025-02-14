#!/bin/bash

set -e

# Variables
CREDENTIALS_PROFILE="delta-staging"
USER_POOL_ID="us-east-1_oHnCLOriG"
USERNAME="jose.nogueira+staging@usedeltaai.com"
USER_ATTRIBUTES='[
  {
    "Name": "custom:dashboards_id",
    "Value": "24,26,-1,-2,-4"
  },
  {
    "Name": "custom:company_cnpj",
    "Value": "75315333000109"
  },
  {
    "Name": "custom:company_name",
    "Value": "Atacadão"
  }
]'

# Update user attributes
aws cognito-idp admin-update-user-attributes \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --user-attributes "$USER_ATTRIBUTES" \
  --profile $CREDENTIALS_PROFILE

echo "User $USERNAME attributes updated successfully in user pool $USER_POOL_ID."
