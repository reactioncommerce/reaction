#!/usr/bin/env bash

# Please Use Google Shell Style: https://google.github.io/styleguide/shell.xml

# ---- Start unofficial bash strict mode boilerplate
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -o errexit  # always exit on error
set -o errtrace # trap errors in functions as well
set -o pipefail # don't ignore exit codes when piping output
set -o posix    # more strict failures in subshells
# set -x          # enable debugging

IFS="$(printf "\n\t")"
# ---- End unofficial bash strict mode boilerplate

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

./.circleci/bin/install-deploy-tools

if [ -z "${AWS_REGION}" ]; then
  AWS_REGION=us-east-1
fi

AWS_ACCESS_KEY_ID_VAR_NAME=KUBECTL_CONFIG_STAGING_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY_VAR_NAME=KUBECTL_CONFIG_STAGING_SECRET_AWS_ACCESS_KEY

if [ "${!AWS_ACCESS_KEY_ID_VAR_NAME}" ]; then
  export AWS_ACCESS_KEY_ID=${!AWS_ACCESS_KEY_ID_VAR_NAME}
fi

if [ "${!AWS_SECRET_ACCESS_KEY_VAR_NAME}" ]; then
  export AWS_SECRET_ACCESS_KEY=${!AWS_SECRET_ACCESS_KEY_VAR_NAME}
fi

mkdir -p ~/.kube
echo Running aws s3 cp s3://${KUBECTL_CONFIG_INT_S3_BUCKET}/${KUBECTL_CONFIG_INT_FILENAME} ~/.kube/config
aws s3 cp s3://${KUBECTL_CONFIG_INT_S3_BUCKET}/${KUBECTL_CONFIG_INT_FILENAME} ~/.kube/config

# set kubectl context to circleci-context
/usr/local/bin/kubectl config use-context circleci-context

echo Running helm upgrade --set imageTag=$CIRCLE_SHA1 reaction-core .reaction/helm-charts/reaction-core -f /dev/stdin
npx --quiet @reactioncommerce/merge-sops-secrets@1.1.1 ./.reaction/helm-charts/reaction-core/bobs-int/values.yaml |
  helm upgrade --set imageTag=$CIRCLE_SHA1 reaction-core .reaction/helm-charts/reaction-core/Chart.yaml -f /dev/stdin
