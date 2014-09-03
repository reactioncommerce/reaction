############################################################
# Dockerfile the demeteorizers a Meteor app, and runs
# as a standard node app.
# See: http://docs.docker.io/
# Example usage:
# cd appdir
# docker build --tag="ongoworks/reaction:0.1.0" .   #build step
# docker push ongoworks/reaction:0.1.0  #push to docker repo
# docker run -p 127.0.0.1:8080:8080 ongoworks/reaction:0.1.0  #run
############################################################

FROM node
MAINTAINER Aaron Judd <aaron@ongoworks.com>

#Install required packages first
RUN apt-get update && apt-get install -qq -y curl git gcc make build-essential imagemagick

# Update to latest node
RUN npm cache clean -f && npm install -g n && n 0.10.29

# Install Meteor
RUN curl https://install.meteor.com | /bin/sh
RUN npm install --silent -g forever meteorite phantomjs

# Add current dir+subs to meteorsrc
ADD . ./meteorsrc
WORKDIR /meteorsrc

# Bundle meteorsrc to /var/www/app
RUN mrt install && meteor bundle --directory /var/www/app

# Set the working directory to be used for commands that are run, including the default CMD below
RUN cd /var/www/app/programs/server && npm install
WORKDIR /var/www/app

#
# Default ENV settings for meteor app
# Required to run meteor!
# either change these or pass as --env in the docker run
#
ENV PORT 8080
ENV ROOT_URL "http://127.0.0.1"
ENV MONGO_URL "mongodb://127.0.0.1:3001/meteor"


# Expose container port 8080 to the host (outside the container)
EXPOSE 8080

RUN touch .foreverignore
# Define default command that runs the node app on container port 8080
CMD forever -w ./main.js