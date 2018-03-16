#!/bin/bash
# outputs each tag we're attaching to this docker image
set -e

SHA=$1
BRANCH=$2
SHA1=$(git rev-parse --verify "${SHA}")

# Echo to stderr
echoerr() { echo "$@" 1>&2; }

# Ensure that git SHA was provided
if [[ -x "${SHA1}" ]]; then
  echoerr "Error, no git SHA provided"
  exit 1;
fi

# tag with the branch
if [[ -n "${BRANCH}" ]]; then
  echo "${BRANCH}"
fi

# Tag with each git tag
git show-ref --tags -d | grep "^${SHA1}" | sed -e 's,.* refs/tags/,,' -e 's/\^{}//' 2> /dev/null \
  | xargs -I % \
  echo "%"

# Tag with latest if certain conditions are met
if [[ "$BRANCH" == "master" ]]; then
  # Check to see if we have a valid `vX.X.X` tag and assign to CURRENT_TAG
  CURRENT_TAG=$( \
    git show-ref --tags -d \
      | grep "^${SHA1}" \
      | sed -e 's,.* refs/tags/,,' -e 's/\^{}//' \
      | grep "^v[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+$" \
      | sort \
  )

  # Find the highest tagged version number
  HIGHEST_TAG=$(git --no-pager tag | grep "^v[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+$" | sort -r | head -n 1)

  # We tag :latest only if
  # 1. We have a current tag
  # 2. The current tag is equal to the highest tag, OR the highest tag does not exist
  if [[ -n "${CURRENT_TAG}" ]]; then
    if [[ "${CURRENT_TAG}" == "${HIGHEST_TAG}" ]] || [[ -z "${HIGHEST_TAG}" ]]; then
      echo "latest"
    fi
  fi
fi