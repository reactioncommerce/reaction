#!/bin/bash

set -e
BRANCH=$CIRCLE_BRANCH
SHA1=$(git rev-parse --verify "${CIRCLE_SHA1}")

# outputs each tag we're attaching to this docker image
function GET_TAGS() {
  # tag with the branch
  echo "${BRANCH}"

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
}