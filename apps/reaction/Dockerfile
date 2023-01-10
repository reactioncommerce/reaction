# Dockerfile for production builds
# syntax=docker/dockerfile:1.4

FROM node:18.10.0-alpine as deps

# hadolint ignore=DL3018
RUN apk --no-cache add bash less curl make g++ glib
SHELL ["/bin/bash", "-o", "pipefail", "-o", "errexit", "-u", "-c"]
WORKDIR /app

COPY ./apps/reaction ./apps/reaction
COPY .npmrc .nvmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm i -g pnpm@7.11.0
RUN pnpm --filter=reaction --prod deploy deps --ignore-scripts

# hadolint ignore=DL3003,SC2015
RUN cd deps/node_modules/sharp && npm run install

FROM node:18.10.0-alpine

# hadolint ignore=DL3018
RUN apk --no-cache add bash less tini vim curl
SHELL ["/bin/bash", "-o", "pipefail", "-o", "errexit", "-u", "-c"]

WORKDIR /usr/local/src/app
ENV PATH=$PATH:/app/node_modules/.bin

# Allow yarn/npm to create ./node_modules
RUN chown node:node .

ENV NODE_ENV=production

COPY --from=deps /app/deps /usr/local/src/app

USER node

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
