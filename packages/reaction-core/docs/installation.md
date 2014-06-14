#Installation

Developers can easily install, and modify Reaction locally.

##Prerequisites
OS X: Install [git](https://github.com/blog/1510-installing-git-from-github-for-mac) command line and [node.js](http://nodejs.org/)

##Installation
    curl https://install.meteor.com | /bin/sh
    sudo -H npm install -g meteorite
    git clone https://github.com/ongoworks/reaction.git
    cd reaction
    mrt update
	

##Startup
To start Reaction, run the `meteor` or `mrt` command:

	meteor

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running (sample data same as on demo site)

The initial admin user for the site is auto generated, and displayed in your console (or see: env variables section to default these)

## Reset
To reset data and give you a fresh test dataset from the reaction-commerce packages private/data

	./bin/reset

In *packages/reaction-core/private/data* there is fixture data that you can modify if want to alter the default initial data.	

##Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying) using config from settings/prod.json

	meteor deploy --settings settings/prod.json yourdemosite.meteor.com

## Configuration Files (optional)
If you will be doing any development or deployment, it's best to configure a configuration file so you aren't typing all your account information in every time you do "meteor reset"

Create [settings/dev.json](https://github.com/ongoworks/reaction/blob/master/settings/dev.sample.json) and populate, or copy dev.sample.json (will work with empty configuration values)

```bash
cp settings/dev.sample.json settings/dev.json
```

If you've created a configuration file, then add `--settings settings/yoursettings.json` to the `meteor`/`mrt` startup command. There are some helper scripts in the *reaction/bin* directory, that make this a bit easier for development.

```bash
#settings from *settings/dev.json*,
./bin/run  
```


Example configuration file
```json
	{
	  "baseUrl": "http://localhost:3000",
	  "googleAnalyticsProperty": "__KEY__",
	  "facebook": {
	    "secret": "__SECRET__"
	  },
	  "public": {
	    "isDebug": true,
	    "facebook": {
	      "appId": "__APP_ID__"
	    }
	  }
	}
```

### Env variables (optional)

```bash
export MAIL_URL="<smtp connection string"
export METEOR_EMAIL="youradmin@yourdomain.com" 
export METEOR_USER="admin"
export METEOR_AUTH="password"
export MONGO_URL="<your mongodb connect string>"
```

The `METEOR_EMAIL`, `METEOR_USER`, `METEOR_AUTH` environment variables will create this email/user/password as the default first site admin user.

To use another Mongodb, rather than the automatically instantiated development one:
```bash
export MONGO_URL=mongodb://localhost:27017/dbname
```

### Email 
To send email you need configure the [env MAIL_URL variable](http://docs.meteor.com/#email_send

Password reset, and a few other items that use email templates won't work unless you configure this.


#Dockerfile

The Dockerfile creates a Docker image of a production version of the application, that has been demeteorized and is ready to run Reaction in a Node.js production environment app container. It does not include a database (hint: mongohq.com is a great place to get a free test db)

You can pull our latest build from the [Docker Hub](https://registry.hub.docker.com/u/ongoworks/reaction/),  or from the Reaction directory you can just do:

```bash
docker build ongoworks/reaction .
```


Typically you would start a Docker/Reaction app container by starting the Docker image like this:

```bash
docker run -i -t -e MONGO_URL="<your mongodb url>" -e ROOT_URL="http://localhost" -e PORT="8080" -p ::8080 -d ongoworks/reaction
```

# Vagrant / Ubuntu

Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/ongoworks/reaction-core/blob/master/doc/vagrant.md)
