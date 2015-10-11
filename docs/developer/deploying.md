# Deploying
An example of a deployment with password to a [meteor.com hosted site](https://docs.meteor.com/#deploying)

  meteor deploy --settings settings/<prod-settings>.json <yoursite>.meteor.com

_Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/installation.md#https)._

## Docker
Requires installation of Docker. On OS X or Windows install [boot2docker](https://boot2docker.io/).

The `Dockerfile` in the project root creates a Docker image of Reaction Commerce, and starts the reaction/meteor bundled version with `forever -w ./main.js` . It includes a local mongo installation, but the container accepts environment variables for configuring `MONGO_URL` to provide an alternate data source.

We provide release images built from the master branch. These are the same images running on reactioncommerce.com. You can pull our latest build from the [Docker Hub](https://hub.docker.com/r/reactioncommerce/reaction/), or from the Reaction directory you can build your own Docker image:

```bash
docker build -t reactioncommerce/reaction-test .
```

Note: if building your own, comment out test packages before building (`sanjo:jasmine`)

Start a Docker/Reaction container using [`docker run`](https://docs.docker.com/reference/commandline/cli/#run):

```bash
docker run -p :8080 -it reactioncommerce/reaction-test
```

You can pass environment variables to Docker using `-e`, so to pass `ROOT_URL` you would do add `-e ROOT_URL="<myhost>"` to `docker run`.

Easy way to remove `force-ssl` for test builds:

```
git clone https://github.com/reactioncommerce/reaction.git
cd reaction
grep -v "force-ssl" .meteor/packages > .packages && mv .packages .meteor/packages
docker build -t reactioncommerce/reaction-test .
docker run -p :3000 -it reactioncommerce/reaction-test
```

## Docker Machine
Install the Docker Toolbox from [https://www.docker.com/toolbox](https://www.docker.com/toolbox).

Build and deploy reaction-drive on AWS with `docker-machine`:

```
docker-machine create --driver amazonec2 --amazonec2-access-key $AWS_KEY --amazonec2-secret-key $AWS_SECRET --amazonec2-instance-type r3.xlarge reaction
$(docker-machine env reaction)
docker build -t reactioncommerce/reaction .
docker run -d -p :80:3000 reactioncommerce/reaction
```

In this example, you'll need to add port 80 your `security group`'s inbound rules.

## Vagrant / Ubuntu
Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/vagrant.md)
