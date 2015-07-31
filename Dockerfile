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
#     -e METEOR_EMAIL="youradmin@yourdomain.com" \
#     -e METEOR_USER="admin" \
#     -e METEOR_AUTH="password" \
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
#     METEOR_EMAIL="youradmin@yourdomain.com"
#     METEOR_USER="admin"
#     METEOR_AUTH="password"
#
##############################################################

FROM mongo:latest
MAINTAINER Aaron Judd <hello@reactioncommerce.com>


ENV DEBIAN_FRONTEND noninteractive

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

# Install Meteor
RUN curl https://install.meteor.com | /bin/sh

# Default (required) Meteor env variables
ENV PORT 3000
ENV ROOT_URL http://localhost
ENV MONGO_URL mongodb://127.0.0.1:27017/meteor
ENV MAIL_URL smtp://localhost:25

# Expose container port 3000 to the host (outside the container)
# you can always map other ports such as 8080 in docker run
EXPOSE 3000
EXPOSE 8080

# Install entrypoint and build scripts
# adding the files locally
# and setting permissions.
COPY bin/docker/entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

COPY bin/docker/build-meteor.sh /usr/bin/build-meteor.sh
RUN chmod +x /usr/bin/build-meteor.sh

# Make sure we have a directory for the application
RUN mkdir -p /var/www
RUN chown -R www-data:www-data /var/www

# add app to /usr/src
VOLUME ["/usr/src/meteor"]
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

# switch to production meteor bundle
WORKDIR /var/www/bundle

# start mongo and reaction
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD []
