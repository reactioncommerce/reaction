#Reaction
Reactive marketing first commerce platform built with Meteor.

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

---	 
#Development
---	

See [Meteor Docs](http://docs.meteor.com) for introduction to [Meteor](http://meteor.com). Meteor and Reaction use a [MVVM](http://en.wikipedia.org/wiki/Model_View_ViewModel) pattern for development, and Javascript and HTML as the only coding languages.

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for format and style of contributions.

###Collections
Convention:

* lowercased
* plural
* **core_ **  prefix for core, reaction platform shared collections names (core_accounts)
* **reaction_** smart package name prefix for smart package specific collection
* no prefix for external/universal meteor collections
* HTML5 and CSS3 
	*  All visible content should have [Schema.org](http://schema.org/docs/full.html) tags
	*  Preference is to use [data-attribute](http://www.w3.org/TR/2011/WD-html5-20110525/elements.html) tags over element selectors
	* All interactive elements should have a data-track element, optional data-track-attrs
			
			data-track="Open Modal" data-track-attrs="{ show: 'Campaign Properties' }"


###Smart Packages

* **reaction_**  prefix followed by camelcased package name
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

* create reaction-foo/package.js

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
####Package References:

* https://www.eventedmind.com/posts/meteor-introducing-the-package-system
* http://book.discovermeteor.com/chapter/creating-a-meteorite-package/
* https://npmjs.org/package/meteor-private-package
* https://atmosphere.meteor.com/wtf/package
