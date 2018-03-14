##############################################################################
# meteor-dev stage - builds image for dev and used with docker-compose.yml
##############################################################################
FROM reactioncommerce/base:v4.0.1 as meteor-dev

LABEL maintainer="Reaction Commerce <architecture@reactioncommerce.com>"

ENV PATH $PATH:/home/node/.meteor

COPY --chown=node package.json $APP_SOURCE_DIR/

RUN meteor npm install

COPY --chown=node . $APP_SOURCE_DIR


##############################################################################
# builder stage - builds the production bundle
##############################################################################
FROM meteor-dev as builder

RUN printf "\\n[-] Running Reaction plugin loader...\\n" \
 && reaction plugins load
RUN printf "\\n[-] Building Meteor application...\\n" \
 && meteor build --server-only --architecture os.linux.x86_64 --directory "$APP_BUNDLE_DIR"

WORKDIR $APP_BUNDLE_DIR/bundle/programs/server/

RUN meteor npm install --production


##############################################################################
# final build stage - create the final production image
##############################################################################
FROM node:8.9.4-slim

# Default environment variables
ENV ROOT_URL "http://localhost"
ENV PORT 3000

# grab the dependencies and built app from the previous builder image
COPY --chown=node --from=builder /opt/reaction/dist/bundle /app

WORKDIR /app

EXPOSE 3000

CMD ["node", "main.js"]
