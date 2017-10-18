#!/bin/bash

set -e

# build new jsdocs
npm install -g jsdoc
echo "Running jsdocs on the reaction codebase"
jsdoc . --verbose --configure .reaction/jsdoc/jsdoc.json

# publish the jsdocs somewhere, or make an image or something cool.
# do that here!
