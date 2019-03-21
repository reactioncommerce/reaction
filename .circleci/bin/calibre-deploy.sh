#!/bin/bash

set -e

URL=$1
LOCATION=$2

# Run One Off Test
./../node_modules/calibre/bin/linux/calibre test create $URL --location=$LOCATION

# Run Snapshot
# California Snapshot Only (Be more generic as we add more site locations to track)
if [ $LOCATION = "California" ]
then
    ./../node_modules/calibre/bin/linux/calibre site create-snapshot --site reaction-core-"$(echo $LOCATION | tr '[A-Z]' '[a-z]')"
else
    echo "No Snapshot Configured for Location"
fi
