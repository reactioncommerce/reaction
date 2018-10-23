#!/bin/bash

sudo apt-get -y install python3-pip wget
sudo pip3 install awscli

export ENVIRONMENT=feat
export CLUSTER=core
export SERVICE=reaction-core
export SERVICE_SUFFIX=$CIRCLE_BRANCH
export CONTAINER=core
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

#mkdir -p ~/.aws
#echo "[default]" > ~/.aws/credentials
#echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> ~/.aws/credentials
#echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> ~/.aws/credentials

#echo "[default]" > ~/.aws/config
#echo "region = ${AWS_REGION}" >> ~/.aws/config

echo Running aws s3 cp s3://${S3_PROPEL_ARTIFACTS_BUCKET}/propel-linux-amd64 ./propel
aws s3 cp s3://${S3_PROPEL_ARTIFACTS_BUCKET}/propel-linux-amd64 ./propel

sudo mv propel /usr/local/bin/propel
sudo chmod +x /usr/local/bin/propel

RELEASE_DESCRIPTION="CircleCI build URL: ${CIRCLE_BUILD_URL}"
echo Running propel param copy --env $ENVIRONMENT --cluster $CLUSTER --service $SERVICE --container $CONTAINER --suffix $SERVICE_SUFFIX --overwrite
propel param copy --env $ENVIRONMENT --cluster $CLUSTER --service $SERVICE --container $CONTAINER --suffix $SERVICE_SUFFIX --overwrite
echo Running propel param set ROOT_URL=https://${SERVICE}-${SERVICE_SUFFIX}.$ENVIRONMENT.reactioncommerce.com/ --env $ENVIRONMENT --cluster $CLUSTER --service $SERVICE --container $CONTAINER --suffix $SERVICE_SUFFIX --overwrite
propel param set ROOT_URL=https://${SERVICE}-${SERVICE_SUFFIX}.$ENVIRONMENT.reactioncommerce.com/ --env $ENVIRONMENT --cluster $CLUSTER --service $SERVICE --container $CONTAINER --suffix $SERVICE_SUFFIX --overwrite
echo Running propel release create --deploy --env $ENVIRONMENT --cluster $CLUSTER --descr "${RELEASE_DESCRIPTION}"
propel release create --deploy --env $ENVIRONMENT --cluster $CLUSTER --descr "${RELEASE_DESCRIPTION}" --suffix $SERVICE_SUFFIX
