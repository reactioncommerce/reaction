#!/bin/bash
set -e

printf "\n[-] Performing post install cleanup...\n\n"

# Clean out docs
rm -rf /usr/share/{doc,doc-base,man,locale,zoneinfo}

# Clean out package management dirs
rm -rf /var/lib/{cache,log}

# clean additional files created outside the source tree
rm -rf /root/{.cache,.config,.local}
rm -rf /tmp/*

# remove os dependencies
apt-get -y purge wget
apt-get -y autoremove
rm -rf /var/lib/apt/lists/*
