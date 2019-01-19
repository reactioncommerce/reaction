#!/bin/bash

sudo apt-get -y install python3-pip wget
sudo pip3 install awscli

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
echo Running aws s3 cp s3://${KUBECTL_CONFIG_STAGING_S3_BUCKET}/${KUBECTL_CONFIG_STAGING_FILENAME} ~/.kube/config
aws s3 cp s3://${KUBECTL_CONFIG_STAGING_S3_BUCKET}/${KUBECTL_CONFIG_STAGING_FILENAME} ~/.kube/config

# download kubectl
curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.13.0/bin/linux/amd64/kubectl
sudo mv kubectl /usr/local/bin
sudo chmod +x /usr/local/bin/kubectl

# set kubectl context to circleci-context
/usr/local/bin/kubectl config use-context circleci-context

# download helm
curl -LO https://storage.googleapis.com/kubernetes-helm/helm-v2.12.2-linux-amd64.tar.gz
tar xvfz helm-v2.12.2-linux-amd64.tar.gz
sudo cp linux-amd64/helm /usr/local/bin
sudo chmod +x /usr/local/bin/helm

# create HELM_HOME and HELM_HOME/plugins
mkdir -p ~/.helm/plugins
export HELM_HOME=~/.helm

# install helm secrets plugin
/usr/local/bin/helm plugin install https://github.com/futuresimple/helm-secrets

helm secrets upgrade --set image.tag=$CIRCLE_SHA1 reaction-core .reaction/helm-charts/reaction-core -f .reaction/helm-charts/reaction-core/secrets.yaml
