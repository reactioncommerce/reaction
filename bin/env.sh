#!/bin/sh

# Set environment variables if needed
# MONGO_URL=mongodb://localhost:27017/myapp
# PORT=3000

if [ -n "$1" ]; then
  METEOR_SETTINGS="$(cat $1)"
  
   ENV_TAG="(`basename \"$1\"`)"

  if [[ $PS1 != $ENV_TAG* ]]; then
      PS1="$ENV_TAG $PS1"
  fi
else
  echo -n "Error: No settings file provided."
  echo " Please provide a settings file as command line argument."
  echo "Example:"
  echo "   \$ source bin/env.sh settings/dev.sample.json && meteor"
  echo ""
fi

