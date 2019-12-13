#!/usr/bin/env bash

# Please Use Google Shell Style: https://google.github.io/styleguide/shell.xml

# ---- Start unofficial bash strict mode boilerplate
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -o errexit  # always exit on error
set -o errtrace # trap errors in functions as well
set -o pipefail # don't ignore exit codes when piping output
set -o posix    # more strict failures in subshells
# set -x          # enable debugging

IFS=$'\n\t'
# ---- End unofficial bash strict mode boilerplate

build_dir="$(dirname "${BASH_SOURCE[0]}")/build"
echo "Deploying ${build_dir} to S3..."
aws s3 cp "${build_dir}" s3://apidocs.v3.reactioncommerce.io/ --recursive --acl public-read
echo "Done!"
