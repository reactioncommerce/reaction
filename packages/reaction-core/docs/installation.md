#Installation

Developers can easily install, and modify Reaction locally.

##Prerequisites
OS X: Install [git](https://github.com/blog/1510-installing-git-from-github-for-mac) command line and [node.js](http://nodejs.org/)

Linux or Vagrant Installation: [Ubuntu / Vagrant Install](https://github.com/ongoworks/reaction-core/blob/master/doc/vagrant.md)

##Installation
    curl https://install.meteor.com | /bin/sh
    sudo -H npm install -g meteorite
    git clone https://github.com/ongoworks/reaction.git
    cd reaction
    mrt update
	

##Startup
	meteor

or to run with settings/dev.json
	
	./bin/run

or run with specific settings just add --settings settings/yoursettings.json

To reset data and give you a fresh test dataset from the reaction-commerce packages private/data

	./bin/reset
	

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running (sample data same as on demo site)

The initial admin user for the site is auto generated, and displayed in your console.

*Note: Optionally you can run and reset with "meteor" and "meteor reset", but you will not load settings data from configuration files. You would need to save them in your data, or create your own private/data*

##Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying) using config from settings/prod.json

	meteor deploy -P --settings settings/prod.json yourdemosite.meteor.com

##Email
To send email you need configure the [env MAIL_URL variable](http://docs.meteor.com/#email_send

## Optional
If you will be doing any development or deployment, it's best to configure a configuration file so you aren't typing all your account information in every time..

Create [settings/dev.json](https://github.com/ongoworks/reaction/blob/master/settings/dev.sample.json) and populate, or copy dev.sample.json (will work with empty configuration values)

	cp settings/dev.sample.json settings/dev.json

Example configuration file

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
