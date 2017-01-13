#!/bin/bash

set -e

DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

# if we're not on a deployment branch, skip the Docker build/test
if [[ "$CIRCLE_BRANCH" != "master" && "$CIRCLE_BRANCH" != "development" ]]; then
  echo "Not running a deployment branch. Skipping the Docker build test."
  exit 0
fi

# build new base and app images
reaction build $DOCKER_NAMESPACE:latest

# run the container and wait for it to boot
docker run -p 80:3000 -d $DOCKER_NAMESPACE:latest
sleep 20

# use curl to ensure the app returns 200's
curl --retry 10 --retry-delay 10 -v http://localhost
