#!/bin/bash

sudo apt-get -y install python3-pip wget
sudo pip3 install awscli

export ENVIRONMENT=staging
export CLUSTER=core
export core_CIRCLE_SHA1=$CIRCLE_SHA1

PROPEL_CONFIG_FILE="propel.yaml"
if [ ! -f ${PROPEL_CONFIG_FILE} ]; then
	echo "Propel configuration file not found!"
	exit 1
fi

if [ -z "${AWS_REGION}" ]; then
        export AWS_REGION=us-west-2
fi

ENV_NAME_UPPERCASE=$(echo $ENVIRONMENT | awk '{print toupper($0)}')
AWS_ACCESS_KEY_ID_VAR_NAME=CLOUDFORMATION_${ENV_NAME_UPPERCASE}_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY_VAR_NAME=CLOUDFORMATION_${ENV_NAME_UPPERCASE}_AWS_SECRET_ACCESS_KEY

if [ "${!AWS_ACCESS_KEY_ID_VAR_NAME}" ]; then
	export AWS_ACCESS_KEY_ID=${!AWS_ACCESS_KEY_ID_VAR_NAME}
fi

if [ "${!AWS_SECRET_ACCESS_KEY_VAR_NAME}" ]; then
	export AWS_SECRET_ACCESS_KEY=${!AWS_SECRET_ACCESS_KEY_VAR_NAME}
fi

echo Running aws s3 cp s3://${S3_PROPEL_ARTIFACTS_BUCKET}/propel-linux-amd64 ./propel
aws s3 cp s3://${S3_PROPEL_ARTIFACTS_BUCKET}/propel-linux-amd64 ./propel

sudo mv propel /usr/local/bin/propel
sudo chmod +x /usr/local/bin/propel

RELEASE_DESCRIPTION="CircleCI build URL: ${CIRCLE_BUILD_URL}"
propel release create --deploy --env $ENVIRONMENT --cluster $CLUSTER --descr "${RELEASE_DESCRIPTION}" 
