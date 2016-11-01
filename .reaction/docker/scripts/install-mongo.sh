#!/bin/bash

set -e

if [ "${INSTALL_MONGO}" = true ]; then

  printf "\n[-] Installing MongoDB ${MONGO_VERSION}...\n\n"

	apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys DFFA3DCF326E302C4787673A01C4E7FAAAB2461C
	apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 42F3E95A2C4F08279C4960ADD68FA50FEA312927

	echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/$MONGO_MAJOR main" > /etc/apt/sources.list.d/mongodb-org.list

	apt-get update

  apt-get install -y \
    mongodb-org=$MONGO_VERSION \
    mongodb-org-server=$MONGO_VERSION \
    mongodb-org-shell=$MONGO_VERSION \
    mongodb-org-tools=$MONGO_VERSION

  rm -rf /var/lib/apt/lists/*
  rm -rf /var/lib/mongodb

  mv /etc/mongod.conf /etc/mongod.conf.orig

fi
