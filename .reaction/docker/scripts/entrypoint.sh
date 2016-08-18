#!/bin/bash

#  Starts local mongdb installation.
#  Starts application main.js
#
#  MONGO_URL env variable will prevent local db start
#
set -e

# set default meteor values if they arent set
: ${PORT:="80"}
: ${ROOT_URL:="http://localhost"}

# Run meteor
exec node ./main.js
