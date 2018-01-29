#!/bin/bash

set -e

DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}

# if we're not on a deployment branch or a Docker related PR branch, skip the Docker build/test

BRANCH=$CIRCLE_BRANCH
SHA1=$(git rev-parse --verify "${CIRCLE_SHA1}")

# Ensure that we build the docker image and tag with the git SHA1 ref.
echo "Building the Docker image."
docker build \
  --build-arg TOOL_NODE_FLAGS="--max-old-space-size=4096" \
  --build-arg INSTALL_MONGO=true \
  -t "${DOCKER_NAMESPACE}:${SHA1}" .

echo "Applying git branch tags to Docker image ${DOCKER_NAMESPACE}:${SHA1}"
docker tag "${DOCKER_NAMESPACE}:${SHA1}" "${DOCKER_NAMESPACE}:${BRANCH}"

echo "Applying git tags to Docker image ${DOCKER_NAMESPACE}:${SHA1}"
git show-ref --tags -d | grep "^${SHA1}" | sed -e 's,.* refs/tags/,,' -e 's/\^{}//' 2> /dev/null \
  | xargs -t -I % \
  echo docker tag "${DOCKER_NAMESPACE}:${SHA1} ${DOCKER_NAMESPACE}:%"

# run the container and wait for it to boot
docker-compose -f .circleci/docker-compose.yml up -d
sleep 30

# use curl to ensure the app returns 200's
docker exec reaction bash -c "apt-get update && apt-get install -y curl && \
  curl --retry 10 --retry-delay 10 -v http://localhost:3000"
