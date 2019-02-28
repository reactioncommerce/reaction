#!/bin/bash

set -e

URL=$1
LOCATION=$2

# Run One Off Test
./../node_modules/calibre/bin/linux/calibre test create $URL --location=$LOCATION

# Run Screenshot
# ./node_modules/calibre/bin/linux/calibre site create-snapshot --site reaction-core-"$(echo $LOCATION | tr '[A-Z]' '[a-z]')"
