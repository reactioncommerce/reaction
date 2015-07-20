#!/bin/bash
#
# utility to install reactioncommcere:* packages
# packages listed in .meteor/packages will be cloned
# and sym-linked to packages/*
#
# used by the circle build scripts to test the complete reaction
# release with latest development branch packages.
#
set -u
set -e

CACHE=../.meteor/.testpkgs
PKGDST=../packages
# ensure repos not cached by using .meteor folder
mkdir -p $CACHE
# loop through packages file and get the reactioncommerce package repos
grep "reactioncommerce:" ../.meteor/packages |while read PACKAGE; do
  REPO=$(meteor show $PACKAGE --show-all |grep 'Git: ' | sed -e 's/Git: //g')
  FOLDER=$(echo $PACKAGE | sed -e 's/reactioncommerce://g')
  if [ -n "$PACKAGE" ]; then
    if [ ! -d "$PKGDST/$FOLDER" ]; then
     echo "Git clone: " $PACKAGE " @ " $REPO " TO " $PKGDST/$FOLDER
     git clone $REPO $CACHE/$FOLDER
    else
     echo "Git pull: " $PACKAGE " IN" $PKGDST/$FOLDER
     git -C $PKGDST/$FOLDER pull
    fi
    # symlink tests
    if [ -d "$PKGDST/$FOLDER/tests" ]; then
      ln -s $PKGDST/$FOLDER/tests ../tests/$FOLDER
    fi
  fi
done

