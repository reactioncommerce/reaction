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
# $DOCKER_NAMESPACE     - the image name for production deployments [Default]: reactioncommerce/reaction
# $DOCKER_NAMESPACE_DEV - the name image for development deployments [Default]: reactioncommerce/prequel


# Master branch deployment (only runs when a version git tag exists - syntax: "v1.2.3")
# The git tag is available in $CIRCLE_TAG
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

docker tag $DOCKER_NAMESPACE:latest $DOCKER_NAMESPACE:$CIRCLE_TAG

docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS

docker push $DOCKER_NAMESPACE:$CIRCLE_TAG
docker push $DOCKER_NAMESPACE:latest
