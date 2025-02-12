#!/bin/bash

set -e

USER_POOL_ID="us-east-1_oHnCLOriG"
USERNAME="seu email"
CREDENTIALS_PROFILE="delta-staging"

# Delete the user from the user pool
aws cognito-idp admin-delete-user --user-pool-id $USER_POOL_ID --username $USERNAME --profile $CREDENTIALS_PROFILE

if [ $? -eq 0 ]; then
  echo "User $USERNAME has been successfully deleted from user pool $USER_POOL_ID."
else
  echo "Failed to delete user $USERNAME from user pool $USER_POOL_ID."
fi
