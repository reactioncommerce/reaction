
#/bin/bash

touch /var/timestamp

# install graphicsmagick
apt-get update
apt-get -qq -y install --no-install-recommends graphicsmagick

# remove anything isntalled by apt in /usr/share/doc after starting this script
find /usr/share/doc \( -type f -o -empty \) -cnewer "/var/timestamp" -delete

# remove unnecessary apt files
apt-get clean
rm -rf /var/lib/apt/lists/*
