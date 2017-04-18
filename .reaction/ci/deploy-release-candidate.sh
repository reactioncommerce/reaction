#!/bin/bash

set -e

## Required environment variables in your CircleCI dashboard
# (used to push to Docker Hub)
#
# $DOCKER_USER  - Docker Hub username
# $DOCKER_PASS  - Docker Hub password
# $DOCKER_EMAIL - Docker Hub email


## Optional Environment Variables
# (used to customize the destination on Docker Hub without having to edit the circle.yml)
#
# $DOCKER_NAMESPACE - the image name for production deployments [Default]: reactioncommerce/reaction


# Development branch deployment
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

# Release candidate tag
# The branch name should always be in the format "release-x.x.x" when this script runs,
# so we can grab the version number from it for the Docker tag
RELEASE_CANDIDATE_VERSION=$(echo "$CIRCLE_BRANCH" | cut -d "-" -f 2)

docker tag $DOCKER_NAMESPACE:latest $DOCKER_NAMESPACE:v$RELEASE_CANDIDATE_VERSION-rc

docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS

docker push $DOCKER_NAMESPACE:v$RELEASE_CANDIDATE_VERSION-rc
