#!/bin/bash

#
# builds a production meteor bundle directory
#
set -e

# Customize packages
/bin/bash bin/docker/build-packages.sh

# Check Themes
/bin/bash bin/docker/build-themes.sh

#
# build the source
#
meteor build --directory /var/www
cd /var/www/bundle/programs/server/ && npm install
