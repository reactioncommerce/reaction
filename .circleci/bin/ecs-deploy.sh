#!/bin/bash

sudo apt-get -y install python3-pip wget jq
sudo pip3 install awscli
wget https://github.com/mikefarah/yq/releases/download/2.0.1/yq_linux_amd64 -O /tmp/yq
sudo mv /tmp/yq /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq

if [ -z "${AWS_REGION}" ]; then
        AWS_REGION=us-west-2
fi

ENVIRONMENT=staging
SERVICE_DIR_NAME=.reaction/devops/aws/services
SERVICES=$(ls ${SERVICE_DIR_NAME})

for SERVICE in $SERVICES; do
        DISABLED=$(echo $SERVICE | grep disabled)
        if [ "${DISABLED}" == "${SERVICE}" ]; then
            continue
        fi
	echo "START PROCESSING SERVICE ${SERVICE}"

	cd ${SERVICE_DIR_NAME}/${SERVICE}

	PROPEL_CONFIG_FILE="propel-${ENVIRONMENT}.yaml"
	if [ ! -f ${PROPEL_CONFIG_FILE} ]; then
	    echo "Propel configuration file not found!"
	    exit 1
	fi

	ENV_NAME_UPPERCASE=$(echo $ENVIRONMENT | awk '{print toupper($0)}')
	AWS_ACCESS_KEY_ID_VAR_NAME=CLOUDFORMATION_${ENV_NAME_UPPERCASE}_AWS_ACCESS_KEY_ID
	AWS_SECRET_ACCESS_KEY_VAR_NAME=CLOUDFORMATION_${ENV_NAME_UPPERCASE}_AWS_SECRET_ACCESS_KEY

	if [ "${!AWS_ACCESS_KEY_ID_VAR_NAME}" ]; then
		AWS_ACCESS_KEY_ID=${!AWS_ACCESS_KEY_ID_VAR_NAME}
	fi

	if [ "${!AWS_SECRET_ACCESS_KEY_VAR_NAME}" ]; then
		AWS_SECRET_ACCESS_KEY=${!AWS_SECRET_ACCESS_KEY_VAR_NAME}
	fi

	mkdir -p ~/.aws
	echo "[default]" > ~/.aws/credentials
	echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> ~/.aws/credentials
	echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> ~/.aws/credentials

	echo "[default]" > ~/.aws/config
	echo "region = ${AWS_REGION}" >> ~/.aws/config

	echo Running aws s3 cp s3://${S3_PROPEL_ARTIFACTS_BUCKET}/propel-linux-amd64 ./propel
	aws s3 cp s3://${S3_PROPEL_ARTIFACTS_BUCKET}/propel-linux-amd64 ./propel

	sudo mv propel /usr/local/bin/propel
	sudo chmod +x /usr/local/bin/propel

	RELEASE_DESCRIPTION="CircleCI build URL: ${CIRCLE_BUILD_URL}"
        propel release create --deploy --descr "${RELEASE_DESCRIPTION}" -f ${PROPEL_CONFIG_FILE}
	
	echo "END PROCESSING SERVICE ${SERVICE}"
	
	cd -
done
