#Deploying Reaction


## Meteor
An example of a deployment to a [Meteor hosted site](http://docs.meteor.com/#deploying)

```
meteor deploy --settings settings/<prod-settings>.json <yoursite>.meteor.com
```
    
*Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction-core/blob/master/docs/installation.md#https).*

##Docker
Docker installation instructions for a variety of platforms can be found in the [Docker](https://docs.docker.com/installation/) documentation.

The `Dockerfile` in the project root is used to build a Docker image. 

It includes some preconfigured services to build and run a production image with Meteor, MongoDB and Reaction.  It includes a local mongo installation, but the container accepts environment variables for configuring `MONGO_URL` to provide an alternate data source.

We provide release images built from the `master` branch, that are built with the latest compatible package dependencies.

###Run
You can pull our latest build from the [Docker Hub](https://registry.hub.docker.com/u/reactioncommerce/reaction/).

```
docker pull reactioncommerce/reaction
docker run -p :3000 -it reactioncommerce/reaction
```


###Build
Or,  from the reaction checkout directory you can build your own Docker image:

```
docker build -t reactioncommerce/reaction-test .
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

##Vagrant / Ubuntu

Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/reactioncommerce/reaction-core/blob/master/docs/vagrant.md)
