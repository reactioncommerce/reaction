#/bin/bash

# install dependencies
apt-get update
apt-get -qq -y install --no-install-recommends ca-certificates bzip2 curl git

# install meteor
curl --progress-bar --fail "https://d3sqy0vbqsdhku.cloudfront.net/packages-bootstrap/1.2.1/meteor-bootstrap-os.linux.x86_64.tar.gz" | tar -xzf - -C "/root" -o
test -x "/root/.meteor/meteor"
ln -s /root/.meteor/meteor /usr/bin/meteor

# install node from meteor tool package
METEOR_TOOL="/root/.meteor/$(dirname "$(readlink "/root/.meteor/meteor")")"
cd "$METEOR_TOOL/dev_bundle"
cp -r --parents bin/node /usr
cp -r --parents include/ /usr

# install npm
curl https://www.npmjs.com/install.sh | sh

# install forever and phantomjs
npm install -g forever phantomjs-prebuilt

# build the meteor application
cd /var/src
/usr/bin/build-meteor.sh

# clean source tree
rm -rf /var/src/packages/*/lib/bower
rm -rf /var/src/packages/*/.npm
rm -rf /var/src/.meteor/local

# clean additional files created outside the source tree
rm -rf /root/.npm /root/.cache /root/.config /root/.cordova /root/.local
rm -rf /tmp/*

# remove npm
rm -rf /usr/bin/npm
rm -rf /usr/lib/node_modules/npm

# remove meteor
rm -rf /usr/bin/meteor
rm -rf /root/.meteor

# remove dependencies
apt-get -qq -y purge ca-certificates curl git bzip2
apt-get -qq -y autoremove
rm -rf /var/lib/apt/lists/*
