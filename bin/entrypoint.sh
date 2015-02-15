#!/bin/bash
#  Starts local mongdb installation.
#
#  Set default settings, pull repository, build
#  app, etc., _if_ we are not given a different
#  command.  If so, execute that command instead.
#
#  parts of this script forked from
#  https://github.com/CyCoreSystems/docker-meteor
#
#  MONGO_URL passed will stop local db creation
#  REPO and BRANCH will build from specificed repo
#  otherwise we'll use the version we built with.
#
set -e

# Default values
: ${APP_DIR:="/var/www"}
: ${PORT:="8080"}
: ${ROOT_URL:="http://127.0.0.1"}
: ${MONGO_URL:="mongodb://127.0.0.1:27017/meteor"}

# If we were given arguments, run them instead
if [ $? -gt 1 ]; then
   exec "$@"
fi

# start mongodb (optional)
if [[ "${MONGO_URL}" == *"127.0.0.1"* ]]; then
  echo "Starting local MongoDB..."
  /usr/local/bin/mongod --smallfiles --fork --logpath /var/log/mongodb.log
fi

# export for meteor
export MONGO_URL
export PORT
export ROOT_URL

# If we are provided a GITHUB_DEPLOY_KEY (path), then
# change it to the new, generic DEPLOY_KEY
if [ -n "${GITHUB_DEPLOY_KEY}" ]; then
   DEPLOY_KEY=$GITHUB_DEPLOY_KEY
fi

# if we are using a repo, we have to use another directory
# to avoid cross-linking docker partition errors
if [ -n "${BRANCH}" ]; then
  APP_DIR="/var/www/${BRANCH}"
  echo "Building branch to ${APP_DIR}"
fi

# If we are given a DEPLOY_KEY, copy it into /root/.ssh and
# setup a github rule to use it
if [ -n "${DEPLOY_KEY}" ]; then
   if [ ! -f /root/.ssh/deploy_key ]; then
      mkdir -p /root/.ssh
      cp ${DEPLOY_KEY} /root/.ssh/deploy_key
      cat << ENDHERE >> /root/.ssh/config
Host *
  IdentityFile /root/.ssh/deploy_key
  StrictHostKeyChecking no
ENDHERE
   fi
fi

mkdir -p /usr/src

if [ -n "${REPO}" ]; then
   echo "Getting ${REPO}..."
   if [ -e /usr/src/app/.git ]; then
      pushd /usr/src/app
      git fetch
      popd
   else
      git clone ${REPO} /usr/src/app
   fi

   cd /usr/src/app

   echo "Switching to branch/tag ${BRANCH}..."
   git checkout ${BRANCH}

   # Find the meteor installation within the repo
   METEOR_DIR=$(find ./ -type d -name .meteor -print |head -n1)
   if [ ! -n "${METEOR_DIR}" ]; then
      echo "Failed to locate Meteor path"
      exit 1;
   fi
   cd ${METEOR_DIR}/..

   # Bundle the Meteor app
   mkdir -p ${APP_DIR}
   set +e # Allow the next command to fail
   meteor build --directory ${APP_DIR}
   if [ $? -ne 0 ]; then
      set -e
      # Old versions used 'bundle' and didn't support the --directory option
      meteor bundle bundle.tar.gz
      tar xf bundle.tar.gz -C ${APP_DIR}
   fi
   set -e
fi

if [ -n "${BUNDLE_URL}" ]; then
   echo "Getting Meteor bundle..."
   wget -O /tmp/bundle.tgz ${BUNDLE_URL}
   tar xf /tmp/bundle.tgz -C ${APP_DIR}
fi

# See if the actual bundle is in the bundle
# subdirectory (default)
if [ -d ${APP_DIR}/bundle ]; then
   APP_DIR=${APP_DIR}/bundle
fi

# Install NPM modules
if [ -e ${APP_DIR}/programs/server ]; then
   pushd ${APP_DIR}/programs/server/
   npm install
   popd
else
   echo "Unable to locate server directory; hold on: we're likely to fail"
fi

# Run meteor
cd ${APP_DIR}
echo "*.log" >> .foreverignore
exec forever -w ./main.js
