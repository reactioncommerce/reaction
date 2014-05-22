############################################################
# Dockerfile for containers that will run a Meteor app on container port 8080
# Based on Ubuntu
############################################################
FROM cmfatih/nodejs
MAINTAINER Aaron Judd <aaron@ongoworks.com>

#Install forever
RUN npm install --silent -g forever

# Create /var/www/app directory
RUN mkdir -p /var/www/app

# Copy the bundle from host into the container;
# name must be bundle.tar.gz;
# the build process unpacks it into a bundle directory automatically

WORKDIR /var/www
ADD https://s3-us-west-2.amazonaws.com/reaction-bundles/bundle.tar.gz /var/www/
RUN tar -xzf bundle.tar.gz

# Reinstall fibers (http://docs.meteor.com/#deploying)
RUN cd /var/www/bundle/programs/server/node_modules && rm -r fibers && npm install fibers@1.0.1

# Copy the extracted and tweaked node application to the final app directory
RUN cp -R /var/www/bundle/* /var/www/app

# Remove the bundle directory now that we're done with it
RUN rm -rf /var/www/bundle

# Set the working directory to be used for commands that are run, including the default CMD below
WORKDIR /var/www/app

# Expose container port 8080 to the host (outside the container)
EXPOSE 22
EXPOSE 8080

# Define default command that runs the node app on container port 8080
CMD PORT=8080 forever -w ./main.js