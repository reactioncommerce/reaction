#!/bin/bash

set -e

DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

# if we're not on a deployment branch or a Docker related PR branch, skip the Docker build/test
if [[ -z "$CIRCLE_TAG" && "$CIRCLE_BRANCH" != "development" && "$CIRCLE_BRANCH" != *"docker"* ]]; then
  echo "Not running a deployment branch. Skipping the Docker build test."
  exit 0
fi

# build new base and app images
reaction build $DOCKER_NAMESPACE:latest

# run the container and wait for it to boot
docker run -p 3000:3000 -d $DOCKER_NAMESPACE:latest
sleep 30

# use curl to ensure the app returns 200's
curl --retry 10 --retry-delay 10 -v http://localhost:3000
