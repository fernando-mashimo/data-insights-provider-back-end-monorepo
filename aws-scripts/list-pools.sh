#!/bin/bash

set -e

CREDENTIALS_PROFILE="delta-staging"

# List all user pools in the account
aws cognito-idp list-user-pools \
  --max-results 60 \
  --query 'UserPools[*].{
    Id: Id,
    Name: Name,
    Status: Status
  }' \
  --output table \
  --profile $CREDENTIALS_PROFILE
