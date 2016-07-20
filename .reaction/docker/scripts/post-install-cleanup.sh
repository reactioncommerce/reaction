#!/bin/bash
set -e

printf "\n[-] Performing post install cleanup...\n\n"

# Clean out docs
rm -rf /usr/share/doc /usr/share/doc-base /usr/share/man /usr/share/locale /usr/share/zoneinfo

# Clean out package management dirs
rm -rf /var/lib/cache /var/lib/log

# clean additional files created outside the source tree
rm -rf /root/.cache /root/.config /root/.local
rm -rf /tmp/*

# remove os dependencies
apt-get -qq -y autoremove
rm -rf /var/lib/apt/lists/*
