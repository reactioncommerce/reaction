#!/bin/bash

#
# builds a production meteor bundle directory
#
set -e

printf "\n[-] Building Meteor application...\n\n"

: ${APP_BUNDLE_DIR:="/var/www"}
: ${BUILD_SCRIPTS_DIR:="/opt/reaction"}

cd $APP_SOURCE_DIR

# Customize packages
bash $BUILD_SCRIPTS_DIR/build-packages.sh

# Generate plugin import files
bash $BUILD_SCRIPTS_DIR/plugin-loader.sh

# Install app deps
meteor npm install --production

# build the source
mkdir -p $APP_BUNDLE_DIR
meteor build --directory $APP_BUNDLE_DIR
cd $APP_BUNDLE_DIR/bundle/programs/server/ && meteor npm install --production

# put the entrypoint script in WORKDIR
mv $BUILD_SCRIPTS_DIR/entrypoint.sh $APP_BUNDLE_DIR/bundle/entrypoint.sh
