#!/bin/bash

#  Starts local mongdb installation.
#  Starts application main.js
#
#  MONGO_URL env variable will prevent local db start
#
set -e

# set default meteor values if they arent set
: ${PORT:="3000"}
: ${ROOT_URL:="http://localhost"}
: ${MONGO_URL:="mongodb://127.0.0.1:27017/meteor"}

#start mongodb (optional)
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  echo "Starting local MongoDB..."
  # startup mongodb
  /usr/bin/mongod --smallfiles --fork --logpath /var/log/mongodb.log

fi

# Run meteor
exec nodemon ./main.js
