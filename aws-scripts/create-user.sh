#!/bin/bash

set -e

# Variables
CREDENTIALS_PROFILE="delta-staging"
USER_POOL_ID="us-east-1_oHnCLOriG"
USERNAME="seu email"
PERMANENT_PASSWORD="sua senha"
USER_ATTRIBUTES='[
  {
    "Name": "email",
    "Value": "seu email"
  },
  {
    "Name": "custom:company_cnpj",
    "Value": ""
  },
  {
    "Name": "custom:company_name",
    "Value": ""
  },
  {
    "Name": "custom:dashboards_id",
    "Value": "6,7,8,9"
  },
  {
    "Name": "email_verified",
    "Value": "true"
  }
]'

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --temporary-password $PERMANENT_PASSWORD \
  --user-attributes "$USER_ATTRIBUTES" \
  --profile $CREDENTIALS_PROFILE \
  --message-action SUPPRESS \
  --output text

# Set password as permanent
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username $USERNAME \
  --password $PERMANENT_PASSWORD \
  --permanent \
  --profile $CREDENTIALS_PROFILE

echo "User $USERNAME created successfully in user pool $USER_POOL_ID with a permanent password."
