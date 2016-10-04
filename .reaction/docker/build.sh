#!/bin/bash

# build the base container and then the app container
docker build -f .reaction/docker/base.dockerfile -t reactioncommerce/base:latest .
docker build -t reactioncommerce/reaction:latest .
