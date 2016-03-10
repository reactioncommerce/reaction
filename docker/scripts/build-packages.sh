#!/bin/bash

#
# add bin/docker/packages to use custom build packages
#

if [ -f bin/docker/packages ]; then
  echo "[-] Using custom Meteor packages file..."
  cp docker/packages .meteor/packages
  exit 0
fi
