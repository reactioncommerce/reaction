#!/bin/bash

set -x

# install OS dependencies
apt-get update
apt-get install -y locales


# fix Meteor/Mongo locale issue on Debian
# https://github.com/meteor/meteor/issues/4019
locale-gen en_US.UTF-8
localedef -i en_GB -f UTF-8 en_US.UTF-8


# install Docker client
curl -L -o /tmp/docker-$DOCKER_VERSION.tgz https://get.docker.com/builds/Linux/x86_64/docker-$DOCKER_VERSION.tgz
tar -xz -C /tmp -f /tmp/docker-$DOCKER_VERSION.tgz
mv /tmp/docker/* /usr/bin
docker -v


# install Docker Compose
curl -L https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose


# install Meteor if it's not already
if [[ -f ~/.meteor/meteor ]]; then
  printf "\nMeteor already installed. Creating symlink.\n"
  ln -s ~/.meteor/meteor /usr/local/bin/meteor;
else
  printf "\Installing Meteor\n"
  curl https://install.meteor.com | /bin/sh
fi


# install Reaction CLI
yarn global add reaction-cli
