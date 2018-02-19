FROM reactioncommerce/base:v4.0.0 as builder

MAINTAINER Reaction Commerce <architecture@reactioncommerce.com>

# copy the app into the build container
COPY . $APP_SOURCE_DIR

# build the app with Meteor
RUN ${BUILD_SCRIPTS_DIR}/build-meteor.sh

# create the final production image
FROM node:8.9.4-slim

WORKDIR /app

# grab the dependencies and built app from the previous builder image
COPY --from=builder /usr/local/bin/gosu /usr/local/bin/gosu
COPY --from=builder /opt/reaction/scripts /tmp/scripts
COPY --from=builder /opt/reaction/dist/bundle .

# define all optional build arg's

# MongoDB
ARG INSTALL_MONGO
ENV INSTALL_MONGO $INSTALL_MONGO
ENV MONGO_VERSION 3.4.11
ENV MONGO_MAJOR 3.4

# PhantomJS
ARG INSTALL_PHANTOMJS
ENV INSTALL_PHANTOMJS $INSTALL_PHANTOMJS
ENV PHANTOM_VERSION 2.1.1

# install optional dependencies if an above --build-arg is supplied
RUN /tmp/scripts/install-phantom.sh
RUN /tmp/scripts/install-mongo.sh

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
