#!/bin/bash

# Allow reaction tests to potentially fail the first time because
# tests sometimes fail due to a SIGKILL during Meteor package npm install.
# Since the install doesn't need to happen on second run, the error is
# often avoided and the false positive doesn't fail the CircleCI build.
#
# This will update npm deps which takes a while

set +e

npm run test:app

if [ $? -eq 0 ]; then
  echo "Reaction tests have passed!"
else
  echo "Reaction tests failed. Trying one more time..."
  set -e
  npm run test:app
fi
