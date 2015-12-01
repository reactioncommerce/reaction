# Deploying
## Docker
Requires installation of Docker. On OS X or Windows install [boot2docker](https://boot2docker.io/).

We provide release images built from the master branch. You can pull our latest build from the [Docker Hub](https://hub.docker.com/r/reactioncommerce/reaction/), or from the Reaction directory you can build your own Docker image.

### Dockerfile
The `Dockerfile` in the project root is an alias, `Dockerfile -> docker/reaction.dev.docker` builds a Docker image of Reaction Commerce that includes a local database and a preconfigured Reaction Commerce implementation .

You can customize the packages that are included in the build by creating a package file in `bin/docker/packages`. The build process will then use your custom package list.

### Build

```bash
docker build -t reaction .
```

### Run
Start a Docker/Reaction container using [`docker run`](https://docs.docker.com/reference/commandline/cli/#run):

The container will accept environment variables for configuring `MONGO_URL` to provide an alternate data source.

You can pass environment variables to Docker using `-e`, so to pass `ROOT_URL` you would do add `-e ROOT_URL="<myhost>"` to `docker run`.

```bash
docker run -p :8080 -it reaction
```

## Docker Machine
Install the Docker Toolbox from [https://www.docker.com/toolbox](https://www.docker.com/toolbox).

Build and deploy `reactioncommerce/reaction` on AWS with `docker-machine`:

```
docker-machine create --driver amazonec2 --amazonec2-access-key $AWS_KEY --amazonec2-secret-key $AWS_SECRET --amazonec2-instance-type r3.xlarge reaction
eval $(docker-machine env reaction)
docker build -t reactioncommerce/reaction .
docker run -d -p :80:3000 reactioncommerce/reaction
```

In this example, you'll need to add port 80 your `security group`'s inbound rules.

## Meteor
An example of a deployment with password to a [Meteor hosted site](https://docs.meteor.com/#deploying)

  meteor deploy --settings settings/<prod-settings>.json <yoursite>.meteor.com

## Vagrant / Ubuntu
Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/vagrant.md)
