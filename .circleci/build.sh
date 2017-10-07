#!/bin/bash

set -e

DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

# if we're not on a deployment branch or a Docker related PR branch, skip the Docker build/test
if [[ "$CIRCLE_BRANCH" != "master" && "$CIRCLE_BRANCH" != *"docker"* ]]; then
  echo "Not running a build branch. Skipping the Docker build test."
  exit 0
fi

# build new image
docker build \
  --build-arg TOOL_NODE_FLAGS="--max-old-space-size=4096" \
  --build-arg INSTALL_MONGO=true \
  -t reactioncommerce/reaction:latest .

# run the container and wait for it to boot
docker-compose -f .circleci/docker-compose.yml up -d
sleep 30

# use curl to ensure the app returns 200's
docker exec reaction bash -c "apt-get update && apt-get install -y curl && \
  curl --retry 10 --retry-delay 10 -v http://localhost:3000"

# now change the image tag to the configured name
docker tag reactioncommerce/reaction:latest $DOCKER_NAMESPACE:latest
