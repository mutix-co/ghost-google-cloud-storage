#!/bin/bash

# change variables below
export PROJECT_ID='';
export BUCKET_NAME='';
export REGION='';
export SERVICE_ACCOUNT_ID='';

# create bucket
gsutil mb -p $PROJECT_ID -l ${REGION} gs://$BUCKET_NAME

# create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_ID \
    --description="service account for $BUCKET_NAME" \
    --display-name=ghost-cloud-storage-$SERVICE_ACCOUNT_ID

# create key
gcloud iam service-accounts keys create key.json \
    --iam-account=$SERVICE_ACCOUNT_ID@$PROJECT_ID.iam.gserviceaccount.com

# setup permission
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT_ID@$PROJECT_ID.iam.gserviceaccount.com:legacyBucketOwner gs://$BUCKET_NAME
