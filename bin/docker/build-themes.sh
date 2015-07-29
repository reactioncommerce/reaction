#!/bin/bash

#
# this is currently a work around for the way that meteor is compiling less
#
# we need to make sure .less files created by the bootstrap build plugin
# this can only be done by running development mode meteor
# anxiously waiting for
# https://meteor.hackpad.com/Improvements-to-LESS-and-other-CSS-preprocessors-fqDPbgOH8Fn
#
if [ ! -f client/themes/bootstrap/custom.reaction.less ]; then
    echo "warning: less theme files not found!!"
    echo "info: using development mode in an attempt to create missing files."
    # startup development server
    command="env -i HOME="$HOME" LC_CTYPE="${LC_ALL:-${LC_CTYPE:-$LANG}}" PATH="$PATH" USER="$USER" /usr/local/bin/meteor"
    log=".build.log"
    match="=> Client modified -- refreshing"

    # wait for meteor to modify client files
    $command > "$log" 2>&1 &
    pid=$!
    while sleep 10
    do
        if fgrep --quiet "$match" "$log"
        then
            kill $pid
            echo "happiness: we've created new theme files"
            exit 0
        fi
    done
fi
