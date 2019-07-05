#!/bin/bash

set -e

URL=$1
LOCATION=$2

# Run One Off Test
npx calibre@2.0.2 test create $URL --location=$LOCATION

# Run Snapshot
# California Snapshot Only (Be more generic as we add more site locations to track)
if [ $LOCATION = "California" ]
then
    npx calibre@2.0.2 site create-snapshot --site reaction-core-"$(echo $LOCATION | tr '[A-Z]' '[a-z]')"
else
    echo "No Snapshot Configured for Location"
fi
