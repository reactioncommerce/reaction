#!/bin/bash
set -e

printf "\n[-] Performing final cleanup...\n"

# get out of the src dir, so we can delete it
cd $APP_BUNDLE_DIR

# Clean out docs
rm -rf /usr/share/{doc,doc-base,man,locale,zoneinfo}

# Clean out package management dirs
rm -rf /var/lib/{cache,log}

# clean additional files created outside the source tree
rm -rf /root/{.cache,.config,.local,.npm,.cordova}
rm -rf /tmp/*

# remove app source
rm -rf $APP_SOURCE_DIR

# remove npm
rm -rf /opt/nodejs/bin/npm
rm -rf /opt/nodejs/lib/node_modules/npm/

# remove meteor
rm -rf /usr/local/bin/meteor
rm -rf /root/.meteor

# remove os dependencies
apt-get -qq -y purge ca-certificates curl bzip2
apt-get -qq -y autoremove
rm -rf /var/lib/apt/lists/*
