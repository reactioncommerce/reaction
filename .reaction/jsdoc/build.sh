#!/bin/bash

set -e

# build new jsdocs
npm install -g jsdoc
jsdoc . --verbose --configure jsdoc.json

# publish the jsdocs somewhere, or make an image or something cool.
# do that here!
