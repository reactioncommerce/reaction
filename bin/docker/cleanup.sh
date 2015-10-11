#!/bin/bash

set -e

# Clean out docs
rm -rf /usr/share/doc /usr/share/doc-base /usr/share/man /usr/share/locale /usr/share/zoneinfo

# Clean out package management dirs
rm -rf /var/lib/cache /var/lib/log

# Clean out /tmp
rm -rf /tmp/*

# Clean out Meteor and app src files
rm -rf ~/.meteor /usr/src/meteor
rm /usr/local/bin/meteor
