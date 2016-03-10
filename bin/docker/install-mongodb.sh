
#/bin/bash

# add the mongodb repo to get the latest release
apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.0 main" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list

# install the mongodb server binaries
apt-get update
apt-get -qq -y install --no-install-recommends adduser mongodb-org-server

# remove unnecessary apt files
apt-get clean
rm -rf /var/lib/apt/lists/*
