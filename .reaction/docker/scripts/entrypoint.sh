#!/bin/bash

#  Starts local mongdb installation.
#  Starts application main.js
#
#  MONGO_URL env variable will prevent local db start
#
set -e


# Set a delay to wait to start meteor container
if [[ $DELAY ]]; then
  echo "Delaying startup for $DELAY seconds"
  sleep $DELAY
fi

# try to start local MongoDB if no external MONGO_URL was set
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  if hash mongod 2>/dev/null; then
    mkdir -p /data/{db,configdb,logs}
    printf "\n[-] External MONGO_URL not found. Starting local MongoDB...\n\n"
    mongod --storageEngine=wiredTiger --fork --logpath /data/logs/mongodb.log
  else
    echo "ERROR: Mongo not installed inside the container."
    echo "Rebuild with INSTALL_MONGO=true or supply a MONGO_URL environment variable."
    exit 1
  fi
fi

if [ "${1:0:1}" = '-' ]; then
	set -- node "$@"
fi

# allow the container to be started with `--user`
if [ "$1" = "node" -a "$(id -u)" = "0" ]; then
  chown -R node:node $APP_BUNDLE_DIR
	exec gosu node "$BASH_SOURCE" "$@"
fi

if [ "$1" = "node" ]; then
	numa="numactl --interleave=all"
	if $numa true &> /dev/null; then
		set -- $numa "$@"
	fi
fi

# Start the app
echo "=> Starting Reaction on port $PORT..."
exec "$@"
