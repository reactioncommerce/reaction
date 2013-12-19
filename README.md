#Reaction
A commerce platform developed with Meteor and following a reactive design pattern.

Reaction is an open source endeavor of [Ongo Works](http://ongoworks.com). We welcome (and need) contributors, issues, comments!

###Core ideas:


* Fast, simple and easy to use for end users as well as store owners.
* A focus on marketing - it's easy to have products, order processing and customer records. Translating that to conversions and traffic are often the difficult component.  
* Limited separation of administrative functionality and "front end". Same template should be used to edit/create/read views.
* Statistics / event tracking should be built in from the beginning throughout
* As modular as possible so that any package can be customized/overwritten - i.e.: need a special order processing process, then override/extend the default
* Core packages to enable site should be a simple and generic as possible, layering complexity by adding packages through a package store ('app store') approach
* Common marketing and SEO practices should be fundamental core features
* UI/UX should be as intuitive as possible, rethinking traditional methods (i.e. inline editing vs forms)
* Pages/routes only used when user would potentially share/bookmark
* Realtime synchronization across platforms/browsers
* Cross platform, responsive focus - should work well natively, without native apps.
* Upgrade paths from existing commerce platforms (Magento, Shopify, BigCommerce)
* Developer friendly. Commercial package and theme development encouraged. Contributors should be rewarded.

###Current Status:
**Unstable, with HEAVY ongoing development!** 

Only good for contributing/observing progress right now. Our estimated timeline:

* Alpha: Late January 2014
* Beta: Late February 2014
* Release Candidate: Q1 2014
	

Please check our [Trello board for current progress](https://trello.com/b/aGpcYS5e/development)

Usually, we have playground here: [Demo/test site](http://reaction.meteor.com)

* Use admin1@ongoworks.com / ongo1 to test dashboard/admin/editing.

---
##Prerequisites
Install [git](https://github.com/blog/1510-installing-git-from-github-for-mac) command line and [node.js](http://nodejs.org/)

##Installation
    curl https://install.meteor.com | /bin/sh
    sudo -H npm install -g meteorite
    git clone https://github.com/ongoworks/reaction.git
    cd reaction
    mrt

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running.


---
#Development
---

See [Meteor Docs](http://docs.meteor.com) for introduction to [Meteor](http://meteor.com).

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for format and style of contributions.

Our core is being built with a preference for Coffeescript + LESS.

We are always using latest full release of all packages.

Packages should be able to run independently, whenever possible but many of the core packages will have dependancies on the reaction-shop package.

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
