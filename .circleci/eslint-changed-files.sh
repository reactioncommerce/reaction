#!/bin/bash

set -eou pipefail

CIRCLE_PR_NUMBER="${CIRCLE_PR_NUMBER:-${CIRCLE_PULL_REQUEST##*/}}" # Determine PR number from pull request link
  if [[ -v CIRCLE_PR_NUMBER ]] && [ -n ${CIRCLE_PR_NUMBER} ]; then
    url="https://api.github.com/repos/${DOCKER_REPOSITORY}/pulls/$CIRCLE_PR_NUMBER" # Get PR from github API
    TARGET_BRANCH=$(curl "$url" | jq '.base.ref' | tr -d '"') # Determine target/base branch from API response
  fi

  if [ -z "${TARGET_BRANCH}" ] || [  ${TARGET_BRANCH} == "null" ]; then
    echo "Not a PR. Skipping eslint-changed-files."
    exit 0
  fi

  echo "Getting list of changed files..."
  CHANGED_FILES=$(git diff --name-only "origin/${TARGET_BRANCH}"..$CIRCLE_BRANCH -- '*.js' | tr '\n' ' ')

  # If we have changed files
  if [ -n "${CHANGED_FILES}" ]; then
    echo "Files have been changed. Run eslint against these files."
    npm run lint:warnings $CHANGED_FILES
  else
    echo "We have no changed files, don't run eslint-changed-files"
  fi
