#!/bin/sh
#
# utility to install reactioncommcere:* packages
# packages are cloned, or pulled to env PACKAGE_DIRS
#
# used by the circle build scripts to test the complete reaction
# release with latest development branch packages.
#
# Getting file doesn't exist errors?
# See:  http://stackoverflow.com/questions/14820329/mkdir-home-error
#
# Use:
# cp bin/clone-packages.sh /usr/local/bin
#
# set default meteor packages dir to tmp
: ${PACKAGE_DIRS:="$HOME/reaction/packages"}

# we'll clone to the package dir
PKGDST=$PACKAGE_DIRS
set -u
set -e

# ensure repos not cached by using .meteor folder
mkdir -p $PKGDST

echo "*****************************************************************"
echo "checking the default branches for reactioncommerce:* packages    "
echo "*****************************************************************"
# loop through packages file and get the reactioncommerce package repos
grep "reactioncommerce:" .meteor/versions|while read PACKAGE; do
  PACKAGE=$(echo $PACKAGE | sed -e 's/@.*//')

  echo "fetching meteor package info ---> " $PACKAGE

  REPO=$(meteor show $PACKAGE --show-all |grep 'Git: ' | sed -e 's/Git: //g')
  FOLDER=$(echo $PACKAGE | sed -e 's/reactioncommerce://g')
  if [ -n "$PACKAGE" ]; then
    # if we've not checked it, now would be a good time
    if [ ! -d "$PKGDST/$FOLDER" ]; then
     echo "Git clone: " $PACKAGE " @ " $REPO " TO " $PKGDST/$FOLDER
     git clone $REPO $PKGDST/$FOLDER
    else
      # yeah, we've got local repos already. let's just pull
     echo "Git pull: " $PACKAGE " IN" $PKGDST/$FOLDER
     git -C $PKGDST/$FOLDER pull
    fi
  fi
done

# just a little eye candy fun after spitting out some code spray
echo "*****************************************************************"
echo "reactioncommerce:* packages updated in " $PACKAGE_DIRS
echo "use: export PACKAGE_DIRS="$PACKAGE_DIRS""
echo "*****************************************************************"
export PACKAGE_DIRS=$PACKAGE_DIRS
exit
