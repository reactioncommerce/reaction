#!/bin/bash

# run reaction test the first time with the +e flag so we can
# This will update npm deps which takes a while
# cfs:tempstore: updating npm dependencies -- combined-stream...
# cfs:gridfs: updating npm dependencies -- mongodb, gridfs-stream...
# sometimes the tests fail the first time because of a SIGKILL because of this
set +e
reaction test |& tee testoutput

set -e
