#!/bin/bash

# build the base container and then the app container
docker build --rm=false -f .reaction/docker/base.dockerfile -t reactioncommerce/base:latest .
docker build --rm=false -t reactioncommerce/reaction:latest .
