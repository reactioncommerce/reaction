#!/bin/bash

printf "\n[-] Installing Meteor.js...\n\n"

apt-get update -qq -y

DEBIAN_FRONTEND=noninteractive apt-get install -qq -y curl git

curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh
