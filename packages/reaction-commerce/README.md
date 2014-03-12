# reaction-commerce

## e-commerce package for reaction and meteor

---

See [Meteor Docs](http://docs.meteor.com) for introduction to [Meteor](http://meteor.com).

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for format and style of contributions.

Please read [conventions.md](conventions.md) for our naming and directory conventions

Our core is being built with a preference for Coffeescript + LESS.

We are always using latest full release of all packages.

Packages should be able to run independently, whenever possible but many of the core packages will have dependancies on the reaction-commerce package.

At this time, for development ease, we are committing all reaction-* packages in this main repo but as we approach a first point release, these will be moved to individual package repos and published on the Meteor package manager. Tests will be added when they are moved to their own repos.

## Trello
For core development team progress tracking please use our [Development Trello board](https://trello.com/b/aGpcYS5e/development)

The board is used as the next task, in any stage, is highest on the list. The workflow moves left to right from planning to release.

*	Planning are tasks we're actively planning and will be worked on
*	Todo are next in queue, just waiting for someone to grab
*	In code review means it's been committed but needs some tuning
*	Doing - active development
*	Release review - acceptance testing and if all is good, moves to done
*	Done is archived on every version release



##Dashboard
Add packages to the reaction dashboard by adding **register.coffee**

	Meteor.app.packages.register(
	  name: "reaction-helloworld"
	  depends: [] #reaction packages
	  label: "HelloWorld"
	  description: "Example Reaction Package"
	  icon: "fa fa-globe"
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

##Roles/Permissions System

###Roles
We use https://github.com/alanning/meteor-roles for providing roles.
Users with "admin" role are full-permission, site-wide users. Package specific roles can be defined in register.coffee

###Permissions
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
	     permission: "dashboard/orders"
	     group: "Shop Management"
	   }
	 ]


##Helpful templates and helpers


	{{>dashboardHeaderLinks}} <!--Unordered list with links to user dashboard links-->