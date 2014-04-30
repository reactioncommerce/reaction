#Reaction Commerce
A commerce platform developed with Meteor and following a reactive design pattern that puts usability and conversions first.


---
###Roadmap & Status:

**Current status: Alpha. Functional but unstable, with HEAVY ongoing development!**

Currently good for contributing/observing progress, testing. It goes without saying that we're constantly refactoring, even things that are functionally done. We will start releasing point versions here when we feel we have reached a reasonable amount of stability for at least the bleeding edge test users. Would not recommend for production usage yet, unless you are very comfortable with the code, and aren't risk averse.

As with all development, some items are ahead of schedule, and some are not.

You can review our [Trello planning board for current progress](https://trello.com/b/ffwTH3tc/reaction-commerce)

**Demonstration & Playground **

	http://demo.reactioncommerce.com
	Admin User: admin1@ongoworks.com
	Password: ongo1


---
###Core ideas:


* Fast, clean, and easy to use for end users as well as store owners.
* Full functionality / matching feature sets that you would expect from Magento, Shopify, Spree, etc.
* A focus on marketing - it's easy to have products, order processing and customer records. Translating that to conversions and traffic are often the difficult component.
* Leveraging data from social networks, and Reaction itself to present actionable merchandising data
* Limited separation of administrative functionality and "front end". Same template should be used to edit/create/read views.
* Realtime data,statistics and event tracking built in from the beginning throughout, and provide actionable information.
* As modular as possible so that any package can be customized/overwritten - i.e.: need a special order processing process, then override/extend the default
* Core packages to enable site should be a simple and generic as possible, layering complexity by adding packages through a package store ('app store') approach
* Common marketing and SEO practices should be fundamental core features
* UI/UX should be as intuitive as possible, rethinking traditional methods (adding a product should be as easy as buying one)
* Pages/routes only used when user would potentially share/bookmark
* Realtime synchronization across platforms/browsers
* Cross platform, responsive focus - should work well natively, without native apps.
* Migration paths from existing commerce platforms (Magento, Shopify, BigCommerce)
* reaction-commerce package can be used as a package in any meteor application
* Designer and developer friendly!
	*  HTML/CSS/Javascript or CoffeeScript knowledge should be sufficient for customization.
	*  Commercial package and theme development encouraged.
	* All contributors should be rewarded. [please contact us](mailto:hello@ongoworks.com)

---
#Development
##Prerequisites
Install [git](https://github.com/blog/1510-installing-git-from-github-for-mac) command line and [node.js](http://nodejs.org/)

##Installation
    curl https://install.meteor.com | /bin/sh
    sudo -H npm install -g meteorite
    git clone https://github.com/ongoworks/reaction.git
    cd reaction
    mrt update


##Startup
	./bin/run

To reset data and give you a fresh test dataset from private/data

	./bin/reset

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running (sample data same as on demo site)

*Note: Optionally you can run and reset with "meteor" and "meteor reset", but you will not load settings data from configuration files. You would need to save them in your data, or create your own private/data*

##Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying) using config from settings/prod.json

	meteor deploy -P --settings settings/prod.json yourdemosite.meteor.com

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

##Developer Docs
Developer docs for new packages at [packages/reaction-commerce/README.md](https://github.com/ongoworks/reaction/tree/master/packages/reaction-commerce)

We're working on comprehensive user and developer docs at [reactioncommerce.com](http://reactioncommerce.com). The reaction commerce site is the github pages branch of the repo.

---
##Reaction Team
Reaction is a project of [Ongo Works](http://ongoworks.com). We also have some light reading on our [blog](http://blog.ongoworks.com/), for those curious about who we are.
