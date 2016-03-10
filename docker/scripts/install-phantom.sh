#!/bin/bash

set -e

if [ "${INSTALL_PHANTOMJS}" = "true" ]; then

  : ${PHANTOMJS_VERSION:=2.1.3}

  printf "\n[-] Installing Phantom.js $PHANTOMJS_VERSION...\n"

  npm install --silent -g phantomjs@$PHANTOMJS_VERSION

  npm cache clear

fi
