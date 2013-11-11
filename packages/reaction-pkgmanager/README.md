#Reaction

A reactive, responsive e-commerce platform that focuses on:

* Non-monolithic service architecture
* Curated package library, hosted on github
* Core and contributed packages installed from dashboard
* Stand-alone packages (each package should be independant)

Simple add for connectors (these are packages as well)

* mixpanel
* google analytics
* mailchimp
* Package UI elements integrate smoothly into front end
* re-usable components
* Packages required passing tests to be upgraded
* Rollback if package installation fails (no broken sites)
* Packages can be stand-alone (all or just one can be used)
* Hot push code deploys
* Gitrecieve push?
* Dashboard notification, upgrade from dashboard


#Reaction Package Manager
Manages meteor packages for Reaction commerce platform

# register.js

		Meteor.startup(function () {
		  console.log("Adding HelloWorld to modules");
		  ReactionPackages.update({
		    name:"reaction-helloworld",
		    title:"HelloWorld",
		    description: "Example Reaction Package",
		    icon: "fa fa-globe fa-5x",
		    route: "/helloworld",
		    template: "helloworld",
		    priority: "2",
		    metafields: {type:''}
		  },{$set:{}},{upsert:true});
		});

Icons available are from the [Font Awesome](http://fortawesome.github.io/Font-Awesome/icons/) v4.0.1 icon library. Use the icon class information here.

# Metafields data
	Can be used to store any data necessary for this package.


"type" has a special functionality for grouping in the navigation and package manager.

	metafields: {type:''} is a top level navigation item that must be enabled.

	metafields: {type:'core'} is automatically enabled for all users

	metafields: {type:'reaction-pkgmanager'} will show up as sub item of "Packages" navigation (or any package you put in)

#Core planned features:
##Packages
##Ecommerce
* Dashboard - Order Management
* Dashboard - Customer Management
* Shop Themes
	*   Theme designer
	*	Themes packages
	*	Theme upload
* Product Catalog
* Cart
	*  Checkout
	*  Account creation
		* Facebook Login
		* Google Login
* Payment Methods
	* 	paypal
	* 	stripe
	* 	balancedpayments
* Shipping Methods
	*   USPS
	* 	FedEx
	*	UPS
	*	Shipwire


##Communication
* Email send
* Email Templates, Themes, default theme
* Email connectors
	*  Mailchimp
	*  Mailgun
	*  Sailthru
	*  Bronto
	*  Amazon SES
* Text Messaging
	*  Phone # collection
	*  SMS Sending


##Connectors
* mixpanel
* google analytics
* google adwords api
* mailchimp
* instagram
* faceboook
* twitter


##Core

* Dashboard
* Reaction smart package manager
* PaaS management

Some devops decisions:
Shared environment?
Developer friendly - server access
Individual Servers?
Docker.io?