#!/bin/bash

############################################################
# This script runs automatically after every 'npm install' #
############################################################

# copy FontAwesome into project
cp -R node_modules/font-awesome/fonts ./public/

# setup plugin imports on client and server
bash .reaction/docker/scripts/plugin-loader.sh
