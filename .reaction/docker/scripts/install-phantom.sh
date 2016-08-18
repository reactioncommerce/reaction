#!/bin/bash

set -e

if [ "${INSTALL_PHANTOMJS}" = "true" ]; then

  printf "\n[-] Installing Phantom.js...\n\n"

  npm install --silent -g phantomjs-prebuilt

  npm cache clear

fi
