#!/bin/bash

set -e

if [ "${INSTALL_PHANTOMJS}" = "true" ]; then

  : ${PHANTOMJS_VERSION:=2.1.1}

  printf "\n[-] Installing Phantom.js $PHANTOMJS_VERSION...\n\n"

  npm install --silent -g phantomjs-prebuilt@$PHANTOMJS_VERSION

  npm cache clear

fi
