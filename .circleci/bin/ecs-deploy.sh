#!/bin/bash

sudo apt-get -y install python3-pip wget
sudo pip3 install awscli
wget https://github.com/mikefarah/yq/releases/download/2.0.1/yq_linux_amd64 -O /tmp/yq
sudo mv /tmp/yq /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq

if [ -z "${AWS_REGION}" ]; then
		AWS_REGION=us-west-2
fi

aws s3 cp --recursive s3://${S3_ECS_DEPLOY_BUCKET}/devops .

cd devops/aws/app
./update-app-stack.sh core-service
