#!/bin/bash

set -u
set -e
# test using velocity
export VELOCITY_TEST_PACKAGES=1
# send testing output to log
meteor test-packages --driver-package velocity:html-reporter --velocity >& logfile.log &
# tail log for passed tests notice
# circle ci test will timeout if we don't pass
tail -f logfile.log | while read LOGLINE
do
   echo ${LOGLINE}
   [[ "${LOGLINE}" == *"tests passed"* ]] && pkill -P $$ tail
done
