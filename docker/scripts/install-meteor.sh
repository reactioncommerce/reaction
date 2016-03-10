#!/bin/bash

set -e

if [ "$DEV_BUILD" = "true" ]; then
  curl https://install.meteor.com/ | sh
else
  # download installer script
  curl https://install.meteor.com -o /tmp/install_meteor.sh

  # read in the release version in the app
  METEOR_VERSION=$(head $APP_SOURCE_DIR/.meteor/release | cut -d "@" -f 2)

  # set the release version in the install script
  sed -i "s/RELEASE=.*/RELEASE=\"$METEOR_VERSION\"/g" /tmp/install_meteor.sh

  # install
  printf "\n[-] Installing Meteor $METEOR_VERSION...\n\n"
  sh /tmp/install_meteor.sh
fi
