############################################################
# Dockerfile for setting up a reaction commerce store instance
# Based on Ubuntu
#
# To use, pull/checkout such that you have the desired files 
# in your working directory, switch to that directory, and then:
# $ mrt install
# $ meteor bundle bundle.tar.gz
# $ sudo docker build -t reaction/store .
#
# "reaction/store" is the desired name for the docker image,
# and should ideally indicate the release or the branch from
# which it was built, for example, "reaction/store_v1.0"
############################################################
FROM cmfatih/nodejs
MAINTAINER Aaron Judd <aaron@ongoworks.com>

# Create /var/www/app directory
RUN mkdir -p /var/www/app
# Copy the bundle from host into the container;
# name must be bundle.tar.gz;
# the build process unpacks it into a bundle directory automatically
ADD bundle.tar.gz /var/www/
# Reinstall fibers (http://docs.meteor.com/#deploying)
RUN cd /var/www/bundle/programs/server/node_modules && rm -r fibers && npm install fibers@1.0.1
# Copy the extracted and tweaked node application to the final app directory
RUN cp -R /var/www/bundle/* /var/www/app
# Remove the bundle directory now that we're done with it
RUN rm -rf /var/www/bundle

# Set the working directory to be used for commands that are run, including the default CMD below
WORKDIR /var/www/app

# Expose container port 8080 to the host (outside the container)
EXPOSE 8080

# Define default command that runs the node app on container port 8080
CMD PORT=8080 /usr/bin/node ./main.js