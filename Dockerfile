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

FROM ubuntu:14.04
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
  graphicsmagick \
  libfreetype6 \
  libfreetype6-dev \
  libssl-dev \
  libfontconfig1 \
  make \
  procps \
  python \
  xz-utils

RUN apt-get -qq upgrade
RUN sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN curl -sL https://deb.nodesource.com/setup_0.12 | bash -
RUN apt-get install -y nodejs mongodb-org
RUN nohup mongod&

#clone reaction commerce
RUN git clone https://github.com/reactioncommerce/reaction

# Expose container port 3000 to the host (outside the container)
EXPOSE 3000

# Install Meteor
RUN curl https://install.meteor.com | /bin/sh

# Rebuild Meteor and start Meteor, Reaction and MongoDB
WORKDIR /reaction
RUN meteor update
RUN npm update
CMD ./reaction
