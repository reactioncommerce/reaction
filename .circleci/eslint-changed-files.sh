#!/usr/bin/env bash

# Please Use Google Shell Style: https://google.github.io/styleguide/shell.xml

# ---- Start unofficial bash strict mode boilerplate
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -o errexit  # always exit on error
set -o errtrace # trap errors in functions as well
set -o pipefail # don't ignore exit codes when piping output
set -o posix    # more strict failures in subshells
# set -x          # enable debugging

IFS=$'\n\t'
# ---- End unofficial bash strict mode boilerplate

# Determine PR number from pull request link
CIRCLE_PR_NUMBER="${CIRCLE_PR_NUMBER:-${CIRCLE_PULL_REQUEST##*/}}"
if [[ -n "${CIRCLE_PR_NUMBER}" ]]; then
  # Get PR from github API
  org_repo=$(git remote -v |
    head -1 |
    awk '{print $2}' |
    cut -d : -f 2 |
    sed 's/\.git$//')
  url="https://api.github.com/repos/${org_repo}/pulls/${CIRCLE_PR_NUMBER}"
  # Determine target/base branch from API response
  TARGET_BRANCH=$(curl --silent --location "${url}" | jq -r '.base.ref' || true)
fi

if [[ -z "${TARGET_BRANCH}" ]] || [[ ${TARGET_BRANCH} == "null" ]]; then
  echo "Not a PR. Skipping eslint-changed-files."
  exit 0
fi

echo "Getting list of changed files..."
CHANGED_FILES=$(git diff --diff-filter=d --name-only "origin/${TARGET_BRANCH}"..$CIRCLE_BRANCH -- '*.js')

# If we have changed files
if [[ -n "${CHANGED_FILES}" ]]; then
  echo "Files have been changed. Run eslint against these files."
  echo "${CHANGED_FILES}" | xargs npm run lint:warnings
else
  echo "We have no changed files, don't run eslint-changed-files"
fi
