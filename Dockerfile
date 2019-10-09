# Dockerfile for production builds
FROM reactioncommerce/node-prod:12.10.0-v1

# The base image copies /src but we need to copy additional folders in this project
COPY --chown=node:node ./public ./public
COPY --chown=node:node ./scripts ./scripts

ENV NODE_OPTIONS="--experimental-modules -r ./scripts/requireExtensions.js"
