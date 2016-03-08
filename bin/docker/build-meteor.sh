#!/bin/bash

#
# builds a production meteor bundle directory
#
set -e

printf "\n[-] Building Meteor application...\n\n"

: ${APP_BUNDLE_DIR:="/var/www"}

cd $APP_SOURCE_DIR

# Customize packages
bash $BUILD_SCRIPTS_DIR/build-packages.sh

#
# build the source
#
mkdir -p $APP_BUNDLE_DIR
meteor build --directory $APP_BUNDLE_DIR
cd $APP_BUNDLE_DIR/bundle/programs/server/ && npm install
