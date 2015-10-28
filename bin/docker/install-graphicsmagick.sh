#/bin/bash

touch /var/timestamp
apt-get update
apt-get -qq -y install --no-install-recommends graphicsmagick
find /usr/share/doc \( -type f -o -empty \) -cnewer "/var/timestamp" -delete
apt-get clean
rm -rf /var/lib/apt/lists/*
