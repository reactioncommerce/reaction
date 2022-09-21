# Dockerfile for production builds
# syntax=docker/dockerfile:1.4

FROM node:14.18.1-alpine as deps

# hadolint ignore=DL3018
RUN apk --no-cache add bash curl less tini vim make python2 git g++ glib
SHELL ["/bin/bash", "-o", "pipefail", "-o", "errexit", "-u", "-c"]
WORKDIR /app

COPY ./apps/reaction ./apps/reaction
COPY .npmrc .nvmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm i -g pnpm@7.11.0
RUN pnpm --filter=@reactioncommerce/reaction-api --prod deploy deps --ignore-scripts --prefer-online


FROM node:14.18.1-alpine

# hadolint ignore=DL3018
RUN apk --no-cache add bash curl less tini vim make python2 git g++ glib
SHELL ["/bin/bash", "-o", "pipefail", "-o", "errexit", "-u", "-c"]

WORKDIR /usr/local/src/app
ENV PATH=$PATH:/app/node_modules/.bin

# Allow yarn/npm to create ./node_modules
RUN chown node:node .

ENV NODE_ENV=production

ARG NPM_TOKEN
COPY --from=deps /app/deps /usr/local/src/app

ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/lib/node_modules/npm/bin/node-gyp-bin:/usr/local/src/app/node_modules/.bin

# The `node-prod` base image installs NPM deps with --no-scripts.
# This prevents the `sharp` lib from working because it installs the binaries
# in a post-install script. We copy their install script here and run it.
# hadolint ignore=DL3003,SC2015
RUN cd node_modules/sharp && (node install/libvips && node install/dll-copy && prebuild-install) || (node-gyp rebuild && node install/dll-copy)

USER node

# delete npm token
RUN rm -f .npmrc || :

# If any Node flags are needed, they can be set in
# the NODE_OPTIONS env variable.
#
# NOTE: We would prefer to use `node .` but relying on
# Node to look up the `main` path is currently broken
# when ECMAScript module support is enabled. When this
# is fixed, change command to:
#
# CMD ["tini", "--", "node", "."]
CMD ["tini", "--", "npm", "start"]
