#!/bin/bash

set -e

DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

shopt -s nocasematch

# if we're not on a deployment branch or a Docker/Release related PR branch, skip the Docker build/test
if ! [[ "$CIRCLE_BRANCH" == "master" || "$CIRCLE_BRANCH" == "development" ||
        "$CIRCLE_BRANCH" =~ "docker" || "$CIRCLE_BRANCH" =~ "release" ]]; then
  echo "Not running a Docker build test branch. Skipping the build."
  exit 0
fi

# build new image
docker build --build-arg TOOL_NODE_FLAGS="--max-old-space-size=4096" -t reactioncommerce/reaction:latest .

# run the container and wait for it to boot
docker-compose -f .circleci/docker-compose.yml up -d
sleep 30

# use curl to ensure the app returns 200's
docker exec reaction bash -c "apt-get update && apt-get install -y curl && \
  curl --retry 10 --retry-delay 10 -v http://localhost:3000"

# now change the image tag to the configured name
docker tag reactioncommerce/reaction:latest $DOCKER_NAMESPACE:latest
