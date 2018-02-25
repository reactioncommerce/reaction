FROM reactioncommerce/base:v4.0.0 as meteor-dev
LABEL maintainer="Reaction Commerce <architecture@reactioncommerce.com>"
# copy the app into the build container
COPY . $APP_SOURCE_DIR
WORKDIR $APP_SOURCE_DIR


FROM meteor-dev as builder
# build a production meteor bundle directory
# Fix permissions warning in Meteor >=1.4.2.1 without breaking
# earlier versions of Meteor with --unsafe-perm or --allow-superuser
# https://github.com/meteor/meteor/issues/7959
WORKDIR $APP_SOURCE_DIR
RUN printf "\\n[-] Running Reaction plugin loader...\\n" \
 && reaction plugins load
RUN printf "\\n[-] Running npm install in app directory...\\n" \
 && meteor npm install
RUN printf "\\n[-] Building Meteor application...\\n" \
 && mkdir -p "$APP_BUNDLE_DIR" \
 && export "METEOR_ALLOW_SUPERUSER=true" \
 && meteor build --server-only --architecture os.linux.x86_64 --directory "$APP_BUNDLE_DIR"
WORKDIR $APP_BUNDLE_DIR/bundle/programs/server/
RUN meteor npm install --production \
 && mv "$BUILD_SCRIPTS_DIR/entrypoint.sh" "$APP_BUNDLE_DIR/bundle/entrypoint.sh"


# create the final production image
FROM node:8.9.4-slim

WORKDIR /app

# grab the dependencies and built app from the previous builder image
COPY --from=builder /usr/local/bin/gosu /usr/local/bin/gosu
COPY --from=builder /opt/reaction/dist/bundle .

# make sure "node" user can run the app
RUN chown -R node:node /app

# Default environment variables
ENV ROOT_URL "http://localhost"
ENV MONGO_URL "mongodb://127.0.0.1:27017/reaction"
ENV PORT 3000

EXPOSE 3000

# start the app
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "main.js"]
