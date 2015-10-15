############################################################
#  Builds a Meteor + Reaction + MongoDB Docker Image
#
#  Important:  Best to run from a clean directory that hasn't had meteor run in it.
#  Important:  packages/<pkg>/.npm and .build* should not exist
#
#  NOTE: this script has some reaction specific scripts,
#        you probably don't want to use this a generic dockerfile
#
#  Usage:
#   Build:
#     cd reaction
#     docker build -t <your org>/reaction .
#
#   Run Reaction, Meteor + local mongo:
#
#   docker run --rm  -p ::3000
#     -e ROOT_URL="http://localhost" \
#     -e REACTION_EMAIL="youradmin@yourdomain.com" \
#     -e REACTION_USER="admin" \
#     -e REACTION_AUTH="password" \
#     -t ongoworks/reaction
#
#
#   Optional Meteor parameters (-e):
#
#     ROOT_URL="< hostname>"
#     MONGO_URL="<your mongodb connect string>"
#     OPLOG_URL="<mongo oplog url>"
#     PORT="<meteor port>"
#     METEOR_SETTINGS="{json}"
#     DISABLE_WEBSOCKETS="1"
#
#   Reaction Specific parameter (-e):
#
#     MAIL_URL="<smtp connection string>"
#     REACTION_EMAIL="youradmin@yourdomain.com"
#     REACTION_USER="admin"
#     REACTION_AUTH="password"
#
##############################################################

FROM mongo:3.0
MAINTAINER Aaron Judd <hello@reactioncommerce.com>

ENV DEBIAN_FRONTEND noninteractive

# https://github.com/meteor/meteor/issues/4019
# ENV LC_ALL C

# Install git, curl, python, etc
# Install imagemagick (optional for cfs:graphicsmagick)
RUN apt-get -qq update && apt-get install -qq -y \
  build-essential \
  apt-utils \
  ca-certificates \
  chrpath \
  curl \
  gcc \
  git \
  graphicsmagick \
  libfreetype6 \
  libfreetype6-dev \
  libssl-dev \
  libfontconfig1 \
  make \
  procps \
  python \
  xz-utils

# install node from package nodesource
RUN apt-get -qq upgrade
RUN curl -sL https://deb.nodesource.com/setup_0.10 | bash -
RUN apt-get install -y nodejs

# Install forever & phantomjs
RUN npm install --silent -g phantomjs nodemon

# https://github.com/meteor/meteor/wiki/File-Change-Watcher-Efficiency
# will only work if docker run in priviledged mode
# RUN echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && sysctl -p

# Install Meteor
RUN curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh

# Default (required) Meteor env variables
ENV PORT 80
ENV ROOT_URL http://localhost
ENV MONGO_URL mongodb://127.0.0.1:27017/meteor

# Expose container port 3000 to the host (outside the container)
# you can always map other ports such as 8080 in docker run
# 80 is the default meteor production port, while 3000 is development mode
EXPOSE 80

# Install entrypoint and build scripts
# adding the files locally
# and setting permissions.
COPY bin/docker/entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

COPY bin/docker/build-meteor.sh /usr/bin/build-meteor.sh
RUN chmod +x /usr/bin/build-meteor.sh

COPY bin/docker/cleanup.sh /usr/bin/cleanup.sh
RUN chmod +x /usr/bin/cleanup.sh

# Make sure we have a directory for the application
RUN mkdir -p /var/www
RUN chown -R www-data:www-data /var/www

# add app to /usr/src
# VOLUME ["/usr/src/meteor"]
VOLUME ["/data/db"]
COPY . /usr/src/meteor
WORKDIR /usr/src/meteor/

#
# Build meteor..
# most of this can go away with Less updates
# coming in Meteor 1.2.0 - however unless you
# package the repo to just run development
# you'll need to do some trick like this
# also runs npm install in programs/server
#
RUN bash /usr/bin/build-meteor.sh

# cleanup
RUN apt-get autoremove -y
RUN npm cache clear
RUN bash /usr/bin/cleanup.sh

# switch to production meteor bundle
WORKDIR /var/www/bundle

# start mongo and reaction
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD []
