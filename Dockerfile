############################################################
#  Builds a Meteor + Reaction + MongoDB Docker Image
#
#  Important:  Best to run from a clean directory that hasn't had meteor run in it.
#  Important:  packages/<pkg>/.npm and .build* should not exist
#
#   Build:
#
#     docker build -t ongoworks/reaction .
#
#   Run Reaction, Meteor + local mongo:
#
#     docker run -it --rm -p :49000:8080 --name reactioncommerce ongoworks/reaction
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
#   Build parameters:
#
#     REPO="https://github.com/reactioncommerce/reaction.git"
#     BRANCH="master"
#
#   Example use:
#
#   docker run --rm -e ROOT_URL="http://testsite.com" \
#     -e REPO="https://github.com/reactioncommerce/reaction.git" \
#     -e BRANCH="master" \
#     -e METEOR_EMAIL="youradmin@yourdomain.com" \
#     -e METEOR_USER="admin" \
#     -e METEOR_AUTH="password" \
#     -t ongoworks/reaction
#
#
##############################################################

FROM mongo:2.6.8
MAINTAINER Aaron Judd <aaron@ongoworks.com>

ENV DEBIAN_FRONTEND noninteractive

# Install git, curl, python, etc
# Install imagemagick (optional for cfs:graphicsmagick)
RUN apt-get -qq update && apt-get install -qq -y curl python gcc make \
  build-essential git ca-certificates nano chrpath libfreetype6  \
  libfreetype6-dev libssl-dev libfontconfig1 imagemagick

# install node
RUN mkdir /nodejs && curl http://nodejs.org/dist/v0.10.36/node-v0.10.36-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1
ENV PATH $PATH:/nodejs/bin

# Install forever & phantomjs
RUN npm install --silent -g forever phantomjs

# Install Meteor to /usr/src
RUN curl https://install.meteor.com | /bin/sh
ADD . /usr/src/meteor
WORKDIR /usr/src/meteor/

# Make sure we have a directory for the application
RUN mkdir -p /var/www
RUN chown -R www-data:www-data /var/www

# Bundle from /usr/src/meteor to /var/www
RUN meteor build --directory /var/www
RUN cd /var/www/bundle/programs/server/ && npm install
WORKDIR /var/www/bundle

# Install entrypoint
ADD bin/entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

# Expose container port 8080 to the host (outside the container)
EXPOSE 8080

# Some housekeeping
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /meteor/src

# Start Meteor, Reaction and MongoDB
ENTRYPOINT ["/usr/bin/entrypoint.sh"]

CMD []
