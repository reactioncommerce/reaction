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

# Import function GET_TAGS
source functions.sh

# Setup variables
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}
SHA1=$(git rev-parse --verify "${CIRCLE_SHA1}")

# Login to docker
docker login -u "${DOCKER_USER}" -p "${DOCKER_PASS}"

# Push image and SHA1 tag
echo "Pushing docker image with SHA1 tag ${DOCKER_NAMESPACE}:${SHA1}"
docker push "${DOCKER_NAMESPACE}:${SHA1}"

# Push remaining tags (git tags, branch, "latest" if applicable)
echo "Pushing remaining tags"
GET_TAGS | xargs -t -I % \
  docker push "${DOCKER_NAMESPACE}:${SHA1}" "${DOCKER_NAMESPACE}:%"

