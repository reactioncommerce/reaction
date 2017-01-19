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


# Development branch deployment
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}
DOCKER_NAMESPACE_DEV=${DOCKER_NAMESPACE_DEV:-"reactioncommerce/prequel"}

docker tag $DOCKER_NAMESPACE:latest $DOCKER_NAMESPACE_DEV:latest
docker tag $DOCKER_NAMESPACE_DEV:latest $DOCKER_NAMESPACE_DEV:$CIRCLE_BUILD_NUM

docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_PASS

docker push $DOCKER_NAMESPACE_DEV:$CIRCLE_BUILD_NUM
docker push $DOCKER_NAMESPACE_DEV:latest
