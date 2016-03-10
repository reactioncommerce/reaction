#!/bin/bash

set -e

if [ "${INSTALL_MONGO}" = "true" ]; then

	: ${MONGO_VERSION:=2.6.11}
	: ${MONGO_MAJOR:=2.6}

  printf "\n[-] Installing MongoDB ${MONGO_VERSION}...\n\n"

	# install version 2.x
	if [ "${MONGO_MAJOR}" = "2."* ]; then
		DEBIAN_FRONTEND=noninteractive apt-get install -qq -y wget
		wget -O mongo.tgz "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-$MONGO_VERSION.tgz"
		wget -O mongo.tgz.sig "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-$MONGO_VERSION.tgz.sig"
		export GNUPGHOME="$(mktemp -d)"
		gpg --keyserver ha.pool.sks-keyservers.net --recv-keys DFFA3DCF326E302C4787673A01C4E7FAAAB2461C
		gpg --batch --verify mongo.tgz.sig mongo.tgz
		rm -r "$GNUPGHOME" mongo.tgz.sig
		tar -xvf mongo.tgz -C /usr/local --strip-components=1
		rm mongo.tgz
		mkdir -p /data/db
		apt-get -qq -y purge wget
	fi

	# install version 3.x
	if [ "${MONGO_MAJOR}" = "3."* ]; then
		apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys DFFA3DCF326E302C4787673A01C4E7FAAAB2461C
		apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 42F3E95A2C4F08279C4960ADD68FA50FEA312927

		echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/$MONGO_MAJOR main" > /etc/apt/sources.list.d/mongodb-org.list

		apt-get update

    DEBIAN_FRONTEND=noninteractive apt-get install -qq -y \
			mongodb-org=$MONGO_VERSION \
			mongodb-org-server=$MONGO_VERSION \
			mongodb-org-shell=$MONGO_VERSION \
			mongodb-org-tools=$MONGO_VERSION

		rm -rf /var/lib/apt/lists/*
		rm -rf /var/lib/mongodb
		mv /etc/mongod.conf /etc/mongod.conf.orig
	fi
fi
