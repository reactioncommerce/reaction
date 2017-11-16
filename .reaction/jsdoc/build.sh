#!/bin/bash
## runs jsdoc
## master branch docs will be published via aws s3 sync when all test pass
set -e

## install awscli
apt-get -y -qq install awscli
## install jsdoc
npm install -g jsdoc
# build new jsdocs
echo "Running jsdocs on the reaction codebase"
jsdoc . --verbose --configure .reaction/jsdoc/jsdoc.json --readme .reaction/jsdoc/templates/static/README.md
