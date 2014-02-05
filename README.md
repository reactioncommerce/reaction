#Reaction
A commerce platform developed with Meteor and following a reactive design pattern that puts usability and conversions first.

Reaction is a project of [Ongo Works](http://ongoworks.com). We welcome contributors, issues, comments.

**If you are interested in joining our alpha+ testing rounds - [please contact us](mailto:contact@ongoworks.com) - we'll make it easy!**

###Core ideas:


* Fast, clean, and easy to use for end users as well as store owners.
* A focus on marketing - it's easy to have products, order processing and customer records. Translating that to conversions and traffic are often the difficult component.
* Leveraging data from social networks, and Reaction itself to present actionable merchandising data
* Limited separation of administrative functionality and "front end". Same template should be used to edit/create/read views.
* Statistics / event tracking should be built in from the beginning throughout
* As modular as possible so that any package can be customized/overwritten - i.e.: need a special order processing process, then override/extend the default
* Core packages to enable site should be a simple and generic as possible, layering complexity by adding packages through a package store ('app store') approach
* Common marketing and SEO practices should be fundamental core features
* UI/UX should be as intuitive as possible, rethinking traditional methods (adding a product should be as easy as buying one)
* Pages/routes only used when user would potentially share/bookmark
* Realtime synchronization across platforms/browsers
* Cross platform, responsive focus - should work well natively, without native apps.
* Upgrade paths from existing commerce platforms (Magento, Shopify, BigCommerce)
* Developer friendly. Commercial package and theme development encouraged. Contributors should be rewarded.
* **reaction-commerce package can used as a package in any meteor environment**


###Roadmap:
**Current status: Unstable, with HEAVY ongoing development! We're now within 4 weeks of a point release for testing.**

Only good for contributing/observing progress right now. Our estimated timeline:

* Catalog/Product Management - functional now (but ongoing refactoring)
* Cart - functional now (but ongoing refactoring)
* Checkout (with shipping/payment methods):
	* *Milestone 1: Late January 2014  (~~search,~~ shipping calc, payments)*
	* Milestone 2: Late February 2014 (promotions, hero, cms, search)
	* Milestone 3: Q1 2014 (social tracking, seo, mixed rate shipping)
	* Milestone 4: Late Q1 2014 (migration tools, multiple themes, theme editor, PaaS)
	* Goal: PaaS Solution Q2 2014


Please check our [Trello board for current progress](https://trello.com/b/aGpcYS5e/development)

Demo, playground at: [Demo/test site](http://demo.reactioncommerce.com)

* Use **admin1@ongoworks.com / ongo1 **to test dashboard/admin/editing.

---
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
	  "filepickerApiKey": "__KEY__",
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


---
