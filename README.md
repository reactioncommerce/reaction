#Reaction
A commerce platform developed with Meteor and following a reactive design pattern.

Reaction is a project of [Ongo Works](http://ongoworks.com). We welcome (and need) contributors, issues, comments!

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

###Roadmap:
**Current status: Unstable, with HEAVY ongoing development!**

Only good for contributing/observing progress right now. Our estimated timeline:

* Catalog/Product Management - functional now (but ongoing refactoring)
* Cart - functional now (but ongoing refactoring)
* Checkout (with shipping/payment methods):
	* Alpha: Late January 2014  (search, shipping calc, payments)
	* Beta: Late February 2014 (promotions, hero, cms)
	* Release Candidate 1: Q1 2014 (social tracking, seo, mixed rate shipping)
	* Release Candidate 2: Late Q1 2014 (migration tools, multiple themes, theme editor, PaaS)
	* Prime time.. PaaS Solution Early Q2 2014


Please check our [Trello board for current progress](https://trello.com/b/aGpcYS5e/development)

Usually, we have playground here: [Demo/test site](http://demo.reactioncommerce.com)

* Use admin1@ongoworks.com / ongo1 to test dashboard/admin/editing.

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

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running.

*Note: Optionally you can run and reset with "meteor" and "meteor reset", but you will not load settings data from configuration files. You would need to save them in your data, or create your own private/data*

##Deploying
An example of a deployment with password to a [meteor.com hosted site](http://docs.meteor.com/#deploying) using config from settings/prod.json

	meteor deploy -P --settings settings/prod.json yourdemosite.meteor.com

## Configuration
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



---
#Development
---

See [Meteor Docs](http://docs.meteor.com) for introduction to [Meteor](http://meteor.com).

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for format and style of contributions.

Please read [conventions.md](conventions.md) for our naming and directory conventions

Our core is being built with a preference for Coffeescript + LESS.

We are always using latest full release of all packages.

Packages should be able to run independently, whenever possible but many of the core packages will have dependancies on the reaction-commerce package.

At this time, for development ease, we are committing all reaction-* packages in this main repo but as we approach an Alpha release, these will be moved to individual package repos and published on the Meteor package manager. Tests will be added when they are moved to their own repos.



#Dashboard
Add packages to the reaction dashboard by adding **register.coffee**

	Meteor.app.packages.register(
	  name: "reaction-helloworld"
	  depends: [] #reaction packages
	  label: "HelloWorld"
	  description: "Example Reaction Package"
	  icon: "fa fa-globe fa-5x"
	  priority: "2"
	  overviewRoute: 'helloworld'
	  hasWidget: true
	  shopPermissions: [
	    {
	      label: "HelloWorld"
	      permission: "/helloworld"
	      group: "Hello World"
	    }
	)

Add widgets to dashboard elements by including a template named packagename-widget

	<template name="reaction-helloworld-widget">
		<div> this is a widget that will appear on dashboard</div
	</template>

#Roles/Permissions System

##Roles
We use https://github.com/alanning/meteor-roles for providing roles.
Users with "admin" role are full-permission, site-wide users. Package specific roles can be defined in register.coffee

##Permissions
Shop has owner, which determine by "ownerId" field in Shop collection.

**To check if user has owner access:**

on client: for current user

	Meteor.app.hasOwnerAccess()

on server: for some shop (current if not defined) and some userId (current if not defined)

	Meteor.app.hasOwnerAccess(shop, userId)

in templates: for current user

	{{#if hasOwnerAccess}}{{/if}}

**Shop has members, which can be admin and have permissions**

If member is admin next methods will always return `true`

To check if user has some specific permissions:

on Client: for current user, where "permissions" is string or [string]

	Meteor.app.hasPermission(permissions)

on Server: for some shop (current if not defined) and some userId (current if not defined), where "permissions" is string or [string]

	Meteor.app.hasPermission(permissions, shop, userId)

in templates:

	{{#if hasShopPermission permissions}}{{/if}}


For using shop permissions into some packages you must add it into register directive.
If we add this package then permissions will be available in Shop Accounts Settings.

	Meteor.app.packages.register
	 name: 'reaction-commerce-orders'
	 provides: ['orderManager']
	 label: 'Orders'
	 overviewRoute: 'shop/orders'
	 hasWidget: false
	 shopPermissions: [
	   {
	     label: "Orders"
	     permission: "shop/orders"
	     group: "Shop Management"
	   }
	 ]

