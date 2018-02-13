#!/bin/bash
# Build and tag docker image with SHA1, branch name, git tag, and latest if necessary
set -e

# Setup variables
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}
SHA1=$(git rev-parse --verify "${CIRCLE_SHA1}")
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build and tag docker image
# Ensure that we build the docker image and tag with the git SHA1 ref.
echo "Building the Docker image."
docker build \
  --build-arg TOOL_NODE_FLAGS="--max-old-space-size=4096" \
  --build-arg INSTALL_MONGO=true \
  -t "${DOCKER_NAMESPACE}:${SHA1}" .

# Get tags and apply them to our Docker image
"${__dir}/docker-tags.sh" "${SHA1}" "${CIRCLE_BRANCH}" | xargs -t -I % \
  docker tag "${DOCKER_NAMESPACE}:${SHA1}" "${DOCKER_NAMESPACE}:%"

# run the container and wait for it to boot
docker-compose -f .circleci/docker-compose.yml up -d
sleep 30

# use curl to ensure the app returns 200's
docker exec reaction bash -c "apt-get update && apt-get install -y curl && \
  curl --retry 10 --retry-delay 10 -v http://localhost:3000"
