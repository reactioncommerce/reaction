#Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying)

  meteor deploy --settings settings/<prod-settings>.json <yoursite>.meteor.com

*Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction-core/blob/master/docs/installation.md#https).*

##Docker
Requires installation of Docker. On OS X or Windows install [boot2docker](http://boot2docker.io/).

The `Dockerfile` in the project root creates a Docker image of Reaction Commerce, and starts the reaction/meteor bundled version with `forever -w ./main.js` . It includes a local mongo installation, but the container accepts environment variables for configuring `MONGO_URL` to provide an alternate data source.

We provide release images built from the master branch. These are the same images running on reactioncommerce.com. You can pull our latest build from the [Docker Hub](https://registry.hub.docker.com/u/ongoworks/reaction/), or from the Reaction directory you can build your own Docker image:

```bash
docker build -t reactioncommerce/reaction-test.
```

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
docker build -t ongoworks/reaction-test .
docker run -p :8080 -it ongoworks/reaction-test
```

*Note: you cannot yet deploy your local docker build to reactioncommerce.com, but this functionality is being developed in the Launchdock project at [launchdock.io](http://launchdock.io/)*

##Vagrant / Ubuntu

Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/reactioncommerce/reaction-core/blob/master/docs/vagrant.md)
