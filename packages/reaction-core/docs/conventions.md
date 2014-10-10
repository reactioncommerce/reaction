#Directory structure

	public *public file assets*
	private *private files*
	settings *runtime configuration files*
	packages
			-> client
				-> templates		 *all client templates*
					-> functionalTriad		*camelCased short functional template naming*
						functionalTriad.less	*triad of functional group, new functionality goes in sub*
						functionalTriad.html
						functionalTriad.coffee
							-> subFunctionalTriad
								subFunctionalTriad.less
								subFunctionalTriad.html
								subFunctionalTriad.coffee
						
				-> lib  *client specific shared libraries*
				register.coffee 	*files common to all client side* *register adds to reaction dashboard*
				routing.coffee
				subscriptions.coffee
			-> common *code common to client and server*
				collections.coffee
			-> lib 		*libraries for server side*
			-> server	*server side code*
				methods.coffee
				publications.coffee
			package.js *package declarations for meteor*
			

#Presentation layer
	-> functionalTriad
		functionalTriad.less
			class="functional-triad-class" *hyphenated class names, replace camel casing*
			id="functional-triad-id"

		functionalTriad.html
			<template name="functionalTriad">

		functionalTriad.coffee
			Template.functionalTriad.helpers
			Template.functionalTriad.events

###Code Style Guide
In general we try to align with the [Meteor style guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide).

#### event,template
When using event, template parameters in methods, use full names

	'click': (event,template) ->

#### return
As much as possible, include the `return` keyword in all functions. Include it alone if you want to return `undefined` since coffeescript will otherwise try to return some other value, and it may not be what you expect or want. Using explicit `return` also makes the code more readable for others.

### console.log
Feel free to have verbose console.logs in the code, but use the following format to not clutter production logging:

```
console.log "Something we want to see during development" if Meteor.settings.public?.isDebug
```


#Server layer
	
	functionalMethod *try to follow functional, action*
	functionalAddItem *example*

#Variable Scope & Namespaces

*common/packageGlobals.js:*

```js
// exported
ReactionCore = {};
ReactionCore.Collections = {};
ReactionCore.Helpers = {};
ReactionCore.Packages = {};
```

*common/collections.coffee:*

```coffee
Product = ReactionCore.Collections.Product = new Meteor.Collection("Product")
# etc...
```

*anyfile.coffee:*

```coffee
# If we're going to use Product collection in this file, which could be in core or in an add-on pkg,
# we can optionally assign to a file-scope variable at the top of the file to keep our code short.
Product = ReactionCore.Collections.Product
# etc...
# At some point, in some file, we eventually define all the variables from packageGlobals.js
helperOne = ->
  return true
```

And the core pkg exports only `ReactionCore`, on both client and server:

```js
api.export(["ReactionCore"]);
```
