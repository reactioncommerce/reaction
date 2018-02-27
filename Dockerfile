# meteor-dev stage - builds image for dev and used with docker-compose.yml
FROM reactioncommerce/base:v4.0.0 as meteor-dev
LABEL maintainer="Reaction Commerce <architecture@reactioncommerce.com>"
ENV PATH $PATH:/home/node/.meteor
WORKDIR $APP_SOURCE_DIR

USER root
RUN chown -R node $APP_SOURCE_DIR

USER node
COPY --chown=node package.json $APP_SOURCE_DIR/
RUN meteor npm install
COPY --chown=node . $APP_SOURCE_DIR

USER root
RUN chown -R node $APP_SOURCE_DIR

USER node

# builder stage - builds the production bundle
FROM meteor-dev as builder
USER root
RUN mkdir -p "$APP_BUNDLE_DIR" \
 && chown -R node "$APP_BUNDLE_DIR"
USER node

# build a production meteor bundle directory
WORKDIR $APP_SOURCE_DIR
RUN printf "\\n[-] Running Reaction plugin loader...\\n" \
 && reaction plugins load
RUN printf "\\n[-] Running npm install in app directory...\\n" \
 && meteor npm install
RUN printf "\\n[-] Building Meteor application...\\n" \
 && meteor build --server-only --architecture os.linux.x86_64 --directory "$APP_BUNDLE_DIR"
WORKDIR $APP_BUNDLE_DIR/bundle/programs/server/
RUN meteor npm install --production
USER node

# final build stage - create the final production image
FROM node:8.9.4-slim

WORKDIR /app

# grab the dependencies and built app from the previous builder image
COPY --from=builder /opt/reaction/dist/bundle .

# make sure "node" user can run the app
RUN chown -R node:node /app

# Default environment variables
ENV ROOT_URL "http://localhost"
ENV MONGO_URL "mongodb://127.0.0.1:27017/reaction"
ENV PORT 3000

EXPOSE 3000

CMD ["node", "main.js"]
