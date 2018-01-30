#!/bin/bash

## Required environment variables in your CircleCI dashboard
# (used to push to Docker Hub)
#
# $DOCKER_USER  - Docker Hub username
# $DOCKER_PASS  - Docker Hub password

## Optional Environment Variables
# (used to customize the destination on Docker Hub without having to edit the CircleCI config)
#
# $DOCKER_NAMESPACE     - the image name for production deployments [Default]: reactioncommerce/reaction

set -e
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}
docker login -u "${DOCKER_USER}" -p "${DOCKER_PASS}"

# Push image and all tags
# docker push "${DOCKER_NAMESPACE}"
echo "Echoing docker images"
docker images
