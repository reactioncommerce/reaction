#!/bin/sh

# Set environment variables if needed
# MONGO_URL=mongodb://localhost:27017/myapp
# PORT=3000

if [ -n "$1" ]; then
  METEOR_SETTINGS="$(cat $1)"
fi

