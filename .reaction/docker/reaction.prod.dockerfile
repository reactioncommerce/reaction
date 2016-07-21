FROM debian:jessie
MAINTAINER Reaction Commerce <hello@reactioncommerce.com>

ENV NODE_VERSION "0.10.46"

# Install PhantomJS
ENV INSTALL_PHANTOMJS "true"

# Meteor environment variables
ENV PORT "80"
ENV ROOT_URL "http://localhost"

# build script directories
ENV APP_SOURCE_DIR "/var/src"
ENV APP_BUNDLE_DIR "/var/www"
ENV BUILD_SCRIPTS_DIR "/opt/reaction"

# Install entrypoint and build scripts
COPY .reaction/docker/scripts $BUILD_SCRIPTS_DIR

RUN chmod -R +x $BUILD_SCRIPTS_DIR

# copy the app to the container
COPY . $APP_SOURCE_DIR

# install base dependencies, build app, cleanup
RUN bash $BUILD_SCRIPTS_DIR/install-deps.sh && \
		bash $BUILD_SCRIPTS_DIR/install-node.sh && \
		bash $BUILD_SCRIPTS_DIR/install-phantom.sh && \
		bash $BUILD_SCRIPTS_DIR/install-meteor.sh && \
 		cd $APP_SOURCE_DIR && \
		bash $BUILD_SCRIPTS_DIR/build-meteor.sh && \
		bash $BUILD_SCRIPTS_DIR/post-build-cleanup.sh

# switch to production meteor bundle
WORKDIR $APP_BUNDLE_DIR/bundle

# 80 is the default meteor production port, while 3000 is development mode
EXPOSE 80

# start mongo and reaction
ENTRYPOINT ["./entrypoint.sh"]
CMD []
