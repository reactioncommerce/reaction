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

FROM cmfatih/nodejs
MAINTAINER Aaron Judd <aaron@ongoworks.com>

#Install required packages first
RUN apt-get install -qq -y curl git gcc make build-essential
RUN curl https://install.meteor.com | /bin/sh
RUN npm install --silent -g forever demeteorizer meteorite

# Add current dir+subs to meteorsrc
ADD . ./meteorsrc
WORKDIR /meteorsrc

# Demeteorize meteorsrc to /var/www/app
RUN mkdir -p /var/www/app && demeteorizer -n v0.10.26 -o /var/www/app

# Set the working directory to be used for commands that are run, including the default CMD below
WORKDIR /var/www/app

RUN rm -rf /usr/local/meteor /usr/local/bin/meteor ~/.meteor
RUN cd /var/www/app/ && npm uninstall --silent fibers && npm update

#
# Default ENV settings for meteor app
# Required to run meteor!
# either change these or pass as --env in the docker run
#
ENV PORT 8080
ENV ROOT_URL "http://127.0.0.1"
ENV MONGO_URL "mongodb://127.0.0.1:3001/meteor"
#ENV MAIL_URL "smtp://user:password@mailhost:port/"

# Expose container port 8080 to the host (outside the container)
EXPOSE 8080

WORKDIR /var/www/app
RUN touch .foreverignore
# Define default command that runs the node app on container port 8080
CMD forever -w ./main.js