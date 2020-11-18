# Dockerfile for production builds
FROM reactioncommerce/node-prod:14.15.0-v1

ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/src/app/node_modules/.bin

# The `node-prod` base image installs NPM deps with --no-scripts.
# This prevents the `sharp` lib from working because it installs the binaries
# in a post-install script. We copy their install script here and run it.
# hadolint ignore=DL3003,SC2015
RUN cd node_modules/sharp && (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)

# The base image copies /src but we need to copy additional folders in this project
COPY --chown=node:node ./public ./public
COPY --chown=node:node ./plugins.json ./plugins.json
