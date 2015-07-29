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

FROM mongo:2.6.8
MAINTAINER Aaron Judd <hello@reactioncommerce.com>

ENV DEBIAN_FRONTEND noninteractive

# Install git, curl, python, etc
# Install imagemagick (optional for cfs:graphicsmagick)
RUN apt-get -qq update && apt-get install -qq -y \
  build-essential \
  ca-certificates \
  chrpath \
  curl \
  gcc \
  git \
  imagemagick \
  libfreetype6 \
  libfreetype6-dev \
  libssl-dev \
  libfontconfig1 \
  make \
  procps \
  python

# install node
RUN mkdir /nodejs && curl http://nodejs.org/dist/v0.10.36/node-v0.10.36-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1

# Default (required) Meteor env variables
ENV PATH $PATH:/nodejs/bin
ENV PORT 3000
ENV ROOT_URL http://localhost
ENV MONGO_URL mongodb://127.0.0.1:27017/meteor
ENV MAIL_URL smtp://localhost:25

# Expose container port 3000 to the host (outside the container)
EXPOSE 3000

# Install forever & phantomjs
RUN npm install --silent -g forever phantomjs

# Install Meteor
RUN curl https://install.meteor.com | /bin/sh

# Install entrypoint
COPY bin/docker/entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

COPY bin/docker/build-meteor.sh /usr/bin/build-meteor.sh
RUN chmod +x /usr/bin/build-meteor.sh

# Make sure we have a directory for the application
RUN mkdir -p /var/www
RUN chown -R www-data:www-data /var/www

# add app to /usr/src
VOLUME ["/usr/src/meteor"]
COPY . /usr/src/meteor
WORKDIR /usr/src/meteor/

# Build meteor
RUN bash /usr/bin/build-meteor.sh

# Rebuild Meteor and start Meteor, Reaction and MongoDB
WORKDIR /var/www/bundle
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
CMD []
