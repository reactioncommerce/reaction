#!/bin/bash

#
# add bin/docker/packages to use custom build packages
#

if [ -f bin/docker/packages ]; then
    echo "info: using custom build package file."
    cp bin/docker/packages .meteor/packages
    exit 0
fi
