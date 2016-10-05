FROM debian:jessie
MAINTAINER Reaction Commerce <admin@reactioncommerce.com>

ENV NODE_VERSION "4.6.0"

# Install MongoDB
ENV INSTALL_MONGO "true"
ENV MONGO_VERSION "3.2.10"
ENV MONGO_MAJOR "3.2"

# Install PhantomJS
ENV INSTALL_PHANTOMJS "true"
ENV PHANTOM_VERSION "2.1.1"

# build directories
ENV APP_SOURCE_DIR "/opt/reaction/src"
ENV APP_BUNDLE_DIR "/opt/reaction/dist"
ENV BUILD_SCRIPTS_DIR "/opt/reaction/build_scripts"

# Add entrypoint and build scripts
COPY .reaction/docker/scripts $BUILD_SCRIPTS_DIR
RUN chmod -R +x $BUILD_SCRIPTS_DIR

# install base dependencies and clean up
RUN cd $BUILD_SCRIPTS_DIR && \
		bash $BUILD_SCRIPTS_DIR/install-deps.sh && \
		bash $BUILD_SCRIPTS_DIR/install-node.sh && \
		bash $BUILD_SCRIPTS_DIR/install-mongo.sh && \
		bash $BUILD_SCRIPTS_DIR/install-phantom.sh && \
		bash $BUILD_SCRIPTS_DIR/post-install-cleanup.sh

# copy the app to the container
ONBUILD COPY . $APP_SOURCE_DIR

# install Meteor, build app, clean up
ONBUILD RUN cd $APP_SOURCE_DIR && \
            bash $BUILD_SCRIPTS_DIR/install-meteor.sh && \
            bash $BUILD_SCRIPTS_DIR/build-meteor.sh && \
            bash $BUILD_SCRIPTS_DIR/post-build-cleanup.sh

# set the default port that Node will listen on
ENV PORT 80
EXPOSE 80

WORKDIR $APP_BUNDLE_DIR/bundle

# start the app
ENTRYPOINT ./entrypoint.sh
CMD []
