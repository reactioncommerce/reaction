#!/bin/bash

set -x

# install Meteor if it's not already
if [[ -f ~/.meteor/meteor ]]; then
  printf "\nMeteor already installed. Creating symlink.\n"
  sudo ln -s ~/.meteor/meteor /usr/local/bin/meteor;
else
  printf "\Installing Meteor\n"
  curl https://install.meteor.com | /bin/sh
fi
