#!/bin/bash
# If we don't see a number of tests passing in the output, rerun tests
# set -e for the next set of tests so we fail on a second test failure
# If we don't see a number of tests passing in the output, rerun tests
# set -e for the next set of tests so we fail on a second test failure

if ! grep '[0-9]\{3,\} passing' testoutput; then
  set -e
  reaction test
else
  # If we have some passing tests, make sure that 'Tests failed'
  # is not in the output. If it is, rerun tests
  if grep 'Tests failed' testoutput; then
    set -e
    reaction test
  fi
fi
