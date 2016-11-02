#!/bin/bash

#
# Add .reaction/docker/packages to use custom
# Meteor packages in the Docker build
#

if [ -f .reaction/docker/packages ]; then
  echo "[-] Using custom Meteor packages file..."
  cp .reaction/docker/packages .meteor/packages
fi
