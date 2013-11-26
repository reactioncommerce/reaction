# Hello World - Reaction Package

Sample 'Hello World' meteor package for Reaction Commerce.

* package.js declares the [package](http://docs.meteor.com/#writingpackages) to the [Meteor](https://github.com/meteor/meteor) server.
* register.js declares the package to the [Reaction](https://github.com/ongoworks/reaction) system.
* router.js declares url routing for the package using [iron-router](https://github.com/EventedMind/iron-router)
* index.html is the "hello world" html template.

Clone to reaction/packages then add package to local meteor server:

	meteor add reaction-helloworld



# register.js

		Meteor.startup(function () {
		  console.log("Adding HelloWorld to packages");
		  ReactionPackages.update({
		    name:"reaction-helloworld",
		    title:"HelloWorld",
		    description: "Example Reaction Package",
		    icon: "fa fa-globe fa-5x",
		    route: "helloworld",
		    template: "helloworld",
		    priority: "2",
		    metafields: {type:''}
		  },{$set:{}},{upsert:true});
		});

Icons available are from the [Font Awesome](http://fortawesome.github.io/Font-Awesome/icons/) icon library.

# Metafields data
	Can be used to store any data necessary for this package.


"type" has a special functionality for grouping in the navigation and package manager.

	metafields: {type:''} is a top level navigation item that must be enabled.

	metafields: {type:'core'} is automatically enabled for all users

	metafields: {type:'reaction-pkgmanager'} will show up as sub item of "Packages" navigation (or any package you put in)
