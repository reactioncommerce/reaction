#!/bin/bash

set -e

if [ "${INSTALL_PHANTOMJS}" = true ]; then

  printf "\n[-] Installing Phantom.js...\n\n"

  PHANTOM_JS="phantomjs-$PHANTOM_VERSION-linux-x86_64"

  apt-get update
  apt-get install -y wget chrpath libssl-dev libxft-dev

  cd /tmp
  wget https://github.com/Medium/phantomjs/releases/download/v$PHANTOM_VERSION/$PHANTOM_JS.tar.bz2
  tar xvjf $PHANTOM_JS.tar.bz2
  mv $PHANTOM_JS /usr/local/share
  ln -sf /usr/local/share/$PHANTOM_JS/bin/phantomjs /usr/local/share/phantomjs
  ln -sf /usr/local/share/$PHANTOM_JS/bin/phantomjs /usr/local/bin/phantomjs
  ln -sf /usr/local/share/$PHANTOM_JS/bin/phantomjs /usr/bin/phantomjs

  printf "\n[-] Successfully installed PhantomJS $(phantomjs -v)\n\n"
fi
