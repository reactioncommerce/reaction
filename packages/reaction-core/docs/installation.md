#Installation

Developers can easily install, and modify Reaction locally.

##Prerequisites
OS X: Install [git](https://github.com/blog/1510-installing-git-from-github-for-mac) command line and [node.js](http://nodejs.org/)

##Installation
    curl https://install.meteor.com | /bin/sh
    git clone https://github.com/reactioncommerce/reaction.git
    cd reaction	


##Startup
To start Reaction, run the `meteor` command:

	meteor

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running (sample data same as on demo site)

The initial admin user for the site is auto generated, and displayed in your console (or see: env variables section to default these)

*Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction-core/blob/master/docs/installation.md#https).*

## Reset
To reset data and give you a fresh test dataset from packages/reaction-core/private/data/*.json

	meteor reset

In *packages/reaction-core/private/data* there is fixture data that you can modify if want to alter the default initial data. See [the package development documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/packages.md) for detailed instructions on modifying this data.	

## Updates
Getting updates is basically the same as installation:

```bash
cd reaction
git pull
meteor reset
meteor
```

*Note: currently we're not testing data schema compatibility between versions, which is why we use `meteor reset` in this example. It's not necessary if you want to preserve your data, but there may be compatibility issues.*

##Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying) using config from settings/prod.json

	meteor deploy --settings settings/prod.json yourdemosite.meteor.com

*Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction-core/blob/master/docs/installation.md#https).*


## settings.json configuration
If you will be doing any development or deployment, it's best to configure a configuration file so you aren't typing all your account information in every time you do "meteor reset"

Create [settings/dev.json](https://github.com/reactioncommerce/reaction/blob/master/settings/dev.sample.json) and populate, or copy dev.sample.json (will work with empty configuration values)

	cp settings/dev.sample.json settings/dev.json

After you've created a configuration file, add `--settings settings/<yoursettings>.json` to the `meteor` startup command. There are some helper scripts in the *reaction/bin* directory, that make this a bit easier for development.


	meteor --settings settings/settings.json  --port 3000


Example configuration file

```json
	{
	  "baseUrl": "http://localhost:3000",
	  "googleAnalyticsProperty": "__KEY__",
	  "facebook": {
	    "secret": "__SECRET__"
	  },
	  "reaction": {
	    "METEOR_USER": "Administrator",
	    "METEOR_AUTH": "password",
	    "METEOR_EMAIL": "root@localhost"
	  },
	  "public": {
	    "isDebug": true,
	    "facebook": {
	      "appId": "__APP_ID__"
	    }
	  }
	}
```

### ENV variables (optional)

You can also use many of the settings as environment variables, useful for headless and automated vm configuration.

```bash
export MAIL_URL="<smtp connection string>"
export METEOR_EMAIL="youradmin@yourdomain.com" 
export METEOR_USER="admin"
export METEOR_AUTH="password"
export MONGO_URL="<your mongodb connect string>"
export ROOT_URL=""
```

Alternatively can also set environment variables by adding them to a settings.json file, like so:

```
"reaction": {
   "METEOR_USER": "Administrator",
   "METEOR_AUTH": "password",
   "METEOR_EMAIL": "root@localhost"
 }
```

This can be useful (or even necessary) when deploying to a remote server that doesn't offer SSH access. *Note: Global environment variables will take precendence over variables set via settings.json*

The `METEOR_EMAIL`, `METEOR_USER`, `METEOR_AUTH` environment variables will create this email/user/password as the default first site admin user.

To use another Mongodb, rather than the automatically instantiated development one:

```bash
export MONGO_URL=mongodb://localhost:27017/dbname
```

If you set ```ROOT_URL``` we'll automatically update the domain in the *shops* collection to match the domain from ROOT_URL. This lets you use alternate domains, or enforce SSL on your installation.  An empty ROOT_URL will just default to *localhost*.


### System Email
To send email you should configure the administrative SMTP email server. [env MAIL_URL variable](http://docs.meteor.com/#email_send)

*Note: This is not required, but password reset, and a few other items that use email templates won't work unless you configure this.*

### HTTPS Redirect
You can use `meteor remove force-ssl` to remove redirection to the `https` protocol.  To add back, `meteor add force-ssl`.  When developing locally, you should not have to remove https as Meteor internally redirects all `localhost` requests to the `http` protocol. However, if you are running on a VM, or using Vagrant, you should run `meteor remove force-ssl` and remove this package locally.

### Fixture data
The initial shop data is loaded from the reactioncommerce:reaction-core package /private/data directory. See [the packages development documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/packages.md) to modify this and other core packages locally.



#Docker

There is a Dockerfile in the project root that creates a Docker image of Reaction Commerce, that has been demeteorized and is starts the reaction meteor bundle as `forever -w ./main.js` . It does not include a database, but the container accepts environment variables for configuration. (hint: compose.io is a great place to get a free test db, or a mongo container)

We provide images built up to date from the master branch. These are the same images running on reactioncommerce.com. You can pull our latest build from the [Docker Hub](https://registry.hub.docker.com/u/ongoworks/reaction/),  or from the Reaction directory you can just do:

```bash
docker build -t ongoworks/reaction .
```

Typically you would start a Docker/Reaction app container by starting the Docker image with the [docker command line `run`](https://docs.docker.com/reference/commandline/cli/#run):

```bash
docker run -i -t -e MONGO_URL="<your mongodb url>" -e ROOT_URL="http://localhost" -e PORT="8080" -p ::8080 -d ongoworks/reaction
```

*Note: you cannot yet deploy your local docker build to reactioncommerce.com, but this functionality is being developed in the Launchdock project at [Launchdock.io](http://launchdock.io/)* 


# Vagrant / Ubuntu

Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/reactioncommerce/reaction-core/blob/master/docs/vagrant.md)

## Failed to load c++ Json message

You can ignore this error, but if it annoys you can run
```xcode-select --install``` (on a mac) or ```sudo apt-get install gcc make build-essential``` (on ubuntu)
