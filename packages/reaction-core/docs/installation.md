#Installation
**Prerequisites: Install npm and [node.js](http://nodejs.org/)**

Ensure that node (with `npm`) is installed, and then install Meteor.
*Optional, but suggested: install `graphicsmagick`*.

Clone the `reactioncommerce/reaction` repo, and then start the application from the Terminal commmand line:

```bash
curl https://install.meteor.com | /bin/sh
git clone https://github.com/reactioncommerce/reaction.git
cd reaction && git checkout master
meteor
```

This is the `master` branch. This will ensure your initial installation is a stable release.

`git checkout development` to use the development branch. See [the package development documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/packages.md) for details on working from the `development` branch.

**Start**
To start Reaction, run the `meteor` command:

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running (sample data same as on demo site)

The initial admin user for the site is auto generated, and displayed in your console (or see: env variables section to default these)

*Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction-core/blob/master/docs/installation.md#https).*

**Reset**
To reset project data and give you a fresh test dataset from `packages/reaction-core/private/data/*.json`:

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

##Meteor settings
A Meteor settings file can be used with the `meteor --settings` option.

Copy [settings/dev.sample.json](https://github.com/reactioncommerce/reaction/blob/master/settings/dev.sample.json) and create a new `settings.json` file, for example:


```json
{
  "ROOT_URL": "",
  "MONGO_URL": "",
  "MAIL_URL": "",
  "reaction": {
    "METEOR_USER": "<username>",
    "METEOR_AUTH": "<password>",
    "METEOR_EMAIL": "<login email>"
  },
  "isDebug": "info"
}
```

After you've created the `settings` file, add `--settings settings/settings.json` to the `meteor` startup command.

    meteor --settings settings/settings.json --raw-logs

### Environment variables

You can also use environment variables for settings, useful for headless and automated vm configuration.

```bash
export ROOT_URL=""
export MONGO_URL="<your mongodb connect string>"
export MAIL_URL="<smtp connection string>"

export METEOR_USER="<username>"
export METEOR_AUTH="<password>"
export METEOR_EMAIL="<login email>"
```

The `METEOR_EMAIL`, `METEOR_USER`, `METEOR_AUTH` environment variables will configure the default administrator account.

*Note: Environment variables will override variables set in settings.json*

**ROOT_URL**

*Export `ROOT_URL` and `packages/reaction-core/fixtures.coffee` will update the domain in the `shops` collection to match the domain from `ROOT_URL`.* This lets you use alternate domains, or enforce SSL on a fresh installation.  An empty ROOT_URL will just default to *localhost*.

**MAIL_URL**
To send email you should configure the administrative SMTP email server. [env MAIL_URL variable](http://docs.meteor.com/#email_send)

*Note: This is not required, but password reset, and a few other items that use email templates won't work unless you configure this.*

**isDebug**
Sets debugging levels. Accepts `true`,`false` or logging level.

See: [conventions#logging](https://github.com/reactioncommerce/reaction-core/blob/development/docs/conventions.md#logging).

**These are the only `reaction specific` variables used from settings.json.**

##Fixture Data

The `reaction-core` package installs sample data, translations, and other fixture defaults from `packages/reaction-core/private/data/`.

Each installed package ('Reaction App') can also provide fixture data.

See [the packages development documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/packages.md) to modify this and other core packages locally.

A `server` method is available for loading collection fixture data:

*server/fixtures.coffee*
```
Meteor.startup ->
  jsonFile =  Assets.getText("private/data/Shipping.json")
  Fixtures.loadData ReactionCore.Collections.Shipping, jsonFile
```

##Troubleshooting

**HTTPS Redirect**
You can use `meteor remove force-ssl` to remove redirection to the `https` protocol.  To add back, `meteor add force-ssl`.  When developing locally, you should not have to remove https as Meteor internally redirects all `localhost` requests to the `http` protocol. However, if you are running on a VM, or using Vagrant, you should run `meteor remove force-ssl` and remove this package locally.

**Failed to load c++ Json message**

You can ignore this error, but if it annoys you can run
`xcode-select --install` (on a mac) or
`sudo apt-get install gcc make build-essential` (on ubuntu)

**env: node: No such file or directory**
Caused by a broken node, npm installation.
Reinstall Node.js with NPM (or when packaged seperately, reinstall them both).

#Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying)

  meteor deploy --settings settings/<prod-settings>.json <yoursite>.meteor.com

*Note: If you are running Reaction remotely (not localhost, ie: vm, aws, docker, etc) and don't want https forwarding, you may remove the [Meteor force-ssl](https://atmospherejs.com/meteor/force-ssl) package using `meteor remove force-ssl`. See [section in docs regarding https](https://github.com/reactioncommerce/reaction-core/blob/master/docs/installation.md#https).*

##Docker
Requires installation of Docker. On OS X or Windows install [boot2docker](http://boot2docker.io/).

There is a Dockerfile in the project root that creates a Docker image of Reaction Commerce, that has been demeteorized and starts the reaction meteor bundle as `forever -w ./main.js` . It does not include a database, but the container accepts environment variables for configuration. (hint: compose.io is a great place to get a free test db, or a mongo container)

We provide up to date images built from the master branch. These are the same images running on reactioncommerce.com. You can pull our latest build from the [Docker Hub](https://registry.hub.docker.com/u/ongoworks/reaction/), or from the Reaction directory you can build your own image:

```bash
docker build -t reactioncommerce/reaction-test.
```

Typically you would start a Docker/Reaction app container by starting the Docker image with the [docker command line `run`](https://docs.docker.com/reference/commandline/cli/#run):

```bash
docker run -p :8080 -it reactioncommerce/reaction-test
```

You can pass environment variables to Docker using `-e`, so to pass `ROOT_URL` you would do add `-e ROOT_URL="<myhost>"` to `docker run`.

*Note: you cannot yet deploy your local docker build to reactioncommerce.com, but this functionality is being developed in the Launchdock project at [launchdock.io](http://launchdock.io/)*


##Vagrant / Ubuntu

Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/reactioncommerce/reaction-core/blob/master/docs/vagrant.md)
