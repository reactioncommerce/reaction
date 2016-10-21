#!/bin/bash

#  Starts local mongdb installation.
#  Starts application main.js
#
#  MONGO_URL env variable will prevent local db start
#
set -e

# start local mongodb if no external MONGO_URL was set
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  if hash mongod 2>/dev/null; then
    mkdir -p /data/db
    printf "\n[-] External MONGO_URL not found. Starting local MongoDB...\n\n"
    mongod --storageEngine=wiredTiger --fork --logpath /var/log/mongodb.log
  else
    echo "ERROR: Mongo not installed inside the container. Rebuild with INSTALL_MONGO=true"
    exit 1
  fi
fi

# Run meteor
exec node ./main.js
