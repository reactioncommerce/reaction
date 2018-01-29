#!/bin/bash
# Build and tag docker image with SHA1, branch name, git tag, and latest if necessary
set -e

DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"reactioncommerce/reaction"}
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
  echo docker tag "${DOCKER_NAMESPACE}:${SHA1}" "${DOCKER_NAMESPACE}:%"

# Special logic for applying latest tag
# Check to see if we're on the master branch
if [[ "$BRANCH" == "master" ]]; then
  # Check to see if we have a valid `vX.X.X` tag and assign to CURRENT_TAG
  CURRENT_TAG=$( \
    git show-ref --tags -d \
      | grep "^${SHA1}" \
      | sed -e 's,.* refs/tags/,,' -e 's/\^{}//' \
      | grep "^v[0-9]\+\.[0-9]\+\.[0-9]\+$" \
      | sort \
  )

  # Find the highest tagged version number
  HIGHEST_TAG=$(git --no-pager tag | grep "^v[0-9]\+\.[0-9]\+\.[0-9]\+$" | sort -r | head -n 1)

  # We tag :latest only if
  # 1. We have a current tag
  # 2. The current tag is equal to the highest tag, OR the highest tag does not exist
  if [[ -n "$CURRENT_TAG" ]]; then
    if [[ "$CURRENT_TAG" == "$HIGHEST_TAG" ]] || [[ -z "$HIGHEST_TAG" ]]; then
      docker tag "${DOCKER_NAMESPACE}:${SHA1}" "${DOCKER_NAMESPACE}:latest"
    fi
  fi
fi

# run the container and wait for it to boot
docker-compose -f .circleci/docker-compose.yml up -d
sleep 30

# use curl to ensure the app returns 200's
docker exec reaction bash -c "apt-get update && apt-get install -y curl && \
  curl --retry 10 --retry-delay 10 -v http://localhost:3000"
