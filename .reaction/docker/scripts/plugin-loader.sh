#!/bin/bash

set -e

# set the plugin import file paths
CLIENT_PLUGINS_FILE=./client/plugins.js
SERVER_PLUGINS_FILE=./server/plugins.js

# clear any contents in the import files
> ./client/plugins.js
> ./server/plugins.js

# define plugin subdirectories
PLUGIN_SUB_DIRS=("core" "custom" "included")

# generate plugin import files on client and server
for plugins in "${PLUGIN_SUB_DIRS[@]}"; do
  for dir in $(find ./imports/plugins/$plugins -mindepth 1 -maxdepth 1 -type d); do
    if [[ -f "$dir/client/index.js" ]]; then
      IMPORT_PATH=$(echo "$dir/client/index.js" | cut -c2-)
      echo "import \"$IMPORT_PATH\";" >> $CLIENT_PLUGINS_FILE
    fi
    if [[ -f "$dir/server/index.js" ]]; then
      IMPORT_PATH=$(echo "$dir/server/index.js" | cut -c2-)
      echo "import \"$IMPORT_PATH\";" >> $SERVER_PLUGINS_FILE
    fi
    if [[ -f "$dir/register.js" ]]; then
      IMPORT_PATH=$(echo "$dir/register.js" | cut -c2-)
      echo "import \"$IMPORT_PATH\";" >> $SERVER_PLUGINS_FILE
    fi
  done
done
