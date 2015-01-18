############################################################
# Builds a Meteor 0.9.x+ application Docker image
#
# See: http://docs.docker.io/
#
#  Important:  Best to run from a clean directory that hasn't had meteor run in it.
#  Important:  packages/<pkg>/.npm and .build* should not exist
#
# Example usage:
#  cd appdir                                                 #in app dir
#  docker build --tag="<org>/<app>" .                        #build step
#  docker push <org>/<app>                                   #push to docker repo
#  docker run -p 127.0.0.1:8080:8080 <org>/<app>             #run
##############################################################

FROM google/debian:wheezy
MAINTAINER Aaron Judd <aaron@ongoworks.com>

# install node + (optional imagemagick for cfs:graphicsmagick)
RUN apt-get update -y && apt-get install --no-install-recommends -y -q curl python gcc make build-essential git ca-certificates nano
RUN mkdir /nodejs && curl http://nodejs.org/dist/v0.10.33/node-v0.10.33-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1
ENV PATH $PATH:/nodejs/bin

# install imagemagick (optional for cfs:graphicsmagick)
RUN apt-get install --no-install-recommends -y -q chrpath libfreetype6 libfreetype6-dev libssl-dev libfontconfig1 imagemagick

#install forever and phantomjs (optional for spiderable)
RUN npm install --silent -g forever phantomjs

# Install Meteor
RUN curl https://install.meteor.com | /bin/sh
ADD . /meteor/src
WORKDIR /meteor/src/

# Bundle meteorsrc to /var/www/app
RUN meteor build --directory /meteor
RUN cd /meteor/bundle/programs/server/ && npm install
WORKDIR /meteor/bundle

#
# Default Meteor ENV settings for meteor app
# either change these or pass as --env in the docker run
#
ENV PORT 8080
ENV ROOT_URL "http://127.0.0.1"
ENV MONGO_URL "mongodb://127.0.0.1:3001/meteor"
ENV DISABLE_WEBSOCKETS "1"

# Expose container port 8080 to the host (outside the container)
EXPOSE 8080

RUN touch .foreverignore

# Define default command that runs the node app on container port 8080
CMD forever -w ./main.js


# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /meteor/src