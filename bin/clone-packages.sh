#!/bin/bash
#
# utility to install reactioncommcer: package from git into packages
#
grep "reactioncommerce:" ../.meteor/packages |while read package; do
  REPO=$(meteor show $package --show-all |grep 'Git:' | sed -e 's/Git: //g')
  echo "Git clone: " $package " @ " $REPO
  git clone $(meteor show $package --show-all |grep 'Git:' | sed -e 's/Git: //g') $package
  mv $package ../packages/
done
