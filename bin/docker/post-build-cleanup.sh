#!/bin/bash
set -e

printf "\n[-] Performing final cleanup...\n"

# Clean out docs
rm -rf /usr/share/doc /usr/share/doc-base /usr/share/man /usr/share/locale /usr/share/zoneinfo

# Clean out package management dirs
rm -rf /var/lib/cache /var/lib/log

# clean source tree
rm -rf /var/src/packages/*/lib/bower
rm -rf /var/src/packages/*/.npm
rm -rf /var/src/.meteor/local

# clean additional files created outside the source tree
rm -rf /root/.npm /root/.cache /root/.config /root/.cordova /root/.local
rm -rf /tmp/*

# remove npm
npm cache clean
rm -rf /usr/bin/npm
rm -rf /usr/lib/node_modules/npm

# remove meteor
rm -rf /usr/bin/meteor
rm -rf /root/.meteor

# remove os dependencies
apt-get -qq -y purge ca-certificates curl git
apt-get -qq -y autoremove
rm -rf /var/lib/apt/lists/*
