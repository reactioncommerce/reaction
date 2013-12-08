#Reaction
Reactive marketing first commerce platform built with Meteor.

The Reaction is building a commerce platform that is built on Meteor and follows a reactive design pattern - most everything you see should be update realtime. Reaction is an open source endeavor of [Ongo Works](http://ongoworks.com). We welcome (and need) contributors, issues, comments!

###Core ideas:

* Limited separation of administrative functionality and "front end". Same template should be used to edit/create/read views.
* Statistics / event tracking should be built in from the beginning throughout
* As modular as possible so that any package can be customized/overwritten - i.e.: need a special order processing process, then override/extend the default
* Core packages to enable site should be a simple and generic as possible, layering complexity by adding packages through a package store ('app store') approach
* Common marketing and SEO practices should be fundamental core features
* User experiences should be as simple as possible, rethinking traditional methods (i.e. inline editing vs forms)
* Pages/routes only used when user would potentially share/bookmark
* Realtime synchronization across platforms/browsers
* Cross platform focus
* Upgrade paths from existing commerce platforms (Magento, Shopify, BigCommerce)
* Commercial package and theme development encouraged

###Current Status:
**Unstable, with HEAVY ongoing development!**
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

	Meteor.app.packages.push(
	  name: "reaction-helloworld"
	  label: "HelloWorld"
	  description: "Example Reaction Package"
	  icon: "fa fa-globe fa-5x"
	  route: "helloworld"
	  template: "helloworld"
	  priority: "2"
	)

Add widgets to dashboard elements by including a template named packagename-widget

	<template name="reaction-helloworld-widget">
		<div> this is a widget that will appear on dashboard</div
	</template>