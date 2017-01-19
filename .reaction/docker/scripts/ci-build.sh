#!/bin/bash

# if we're not on a deployment branch, skip the Docker build/test
if [[ "$CIRCLE_BRANCH" != "master" && "$CIRCLE_BRANCH" != "development" ]]; then
  echo "Not running a deployment branch. Skipping the Docker build test."
  exit 0
fi

# load up cached image if there is one
if [[ -e ~/docker/image.tar ]]; then
  docker load -i ~/docker/image.tar
fi

# build new base and app images
.reaction/docker/build.sh

# if successful, save in cache
mkdir -p ~/docker
docker save reactioncommerce/reaction:latest > ~/docker/image.tar

# run the container and wait for it to boot
docker-compose -f .reaction/docker/docker-compose.test.yml up -d
sleep 30

# use curl to ensure the app returns 200's
curl --retry 10 --retry-delay 10 -v http://localhost
