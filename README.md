#Reaction
Reactive marketing first commerce platform built with Meteor.

The Reaction is building a commerce platform that is built on Meteor and follows a reactive design pattern - most everything you see should be update realtime. Reaction is a commercial/open source endeavor of [Ongo Works](http://ongoworks.com). We welcome contributors, issues, comments!

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


---
##Prerequisites
Install [git](https://github.com/blog/1510-installing-git-from-github-for-mac) command line and [node.js](http://nodejs.org/)
		
##Installation
    curl https://install.meteor.com | /bin/sh
    sudo -H npm install -g meteorite
    git clone https://github.com/ongoworks/reaction.git
    cd reaction
    mrt

Now open [http://localhost:3000](http://localhost:3000) in a browser and you should see Reaction running.
 
* Use admin1@ongoworks.com / ongo1 to test dashboard/admin/editing.

---	 
#Development
---	

See [Meteor Docs](http://docs.meteor.com) for introduction to [Meteor](http://meteor.com). Meteor and Reaction use a [MVVM](http://en.wikipedia.org/wiki/Model_View_ViewModel) pattern for development, and Javascript (+Coffeescript) and HTML (CSS/LESS) as the only coding languages.

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for format and style of contributions.

Feel free to use Coffeescript or plain JS. Our core is being built with a preference for Coffeescript + LESS.

We are always using latest full release of all packages.

Packages should be able to run independently, whenever possible but many of the core packages will have dependancies on the reaction-shop package.

At this time, for development ease, we are committing all reaction-* packages in this main repo but as we approach an Alpha release, these will be moved to individual package repos and published on the Meteor package manager.


###Smart Packages

* **reaction-**  prefix followed by hyphenated package name (e.g. "reaction-shop")
* name all dependencies in package.js
* name all files in api
* create packages in **reaction/packages** directory with the following convention

		reaction-foo/               # <- all functionality related to package 'foo'
		reaction-foo/lib/           # <- common code
		reaction-foo/models/        # <- model definitions
		reaction-foo/client/        # <- files only sent to the client
		reaction-foo/server/        # <- files only available on the server
* create reaction-foo/smart.json

		{
		  "name": "reaction-greetramp",
		  "description": "Reaction Greetramp package - an email capture tool",
		  "homepage": "https://github.com/ongoworks/reaction-greetramp",
		  "author": "Aaron judd (http://ongoworks.com)",
		  "version": "0.1.0",
		  "git": "https://github.com/ongoworks/reaction-greetramp.git",
		  "packages": {
		    "reaction-greetramp": "0.0.1"
		  }
		}

* create reaction-foo/server/package.js

		// Give our package a description
		Package.describe({
		  summary: "Reaction Greetramp package - an email capture tool"
		});
		
		// Tell Meteor what to do with our package at bundle time
		Package.on_use(function (api) {
		
		  // The api.use method allows us to depend on other
		  // packages that ship with meteor or are in our project's
		  // package directory
		  api.use(["underscore", "templating"], "client");
		
		  // we can add files to the client, server, or both
		  // in this case load both.js on the client AND the server
		  api.add_files("both.js", ["client", "server"]);
		
		
		  // Add templates.html and client.js files ONLY on
		  // the client
		  api.add_files(["templates.html", "client.js"], "client");
		});
