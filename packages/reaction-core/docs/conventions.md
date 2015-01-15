# Pull Requests
Please make sure your pull requests are to the active development branch, and not the `master` branch. This would be the branch with a version number that would follow the current tagged release version of `reactioncommerce/reaction` repo.

When you create a pull request, you can click the 'edit' button to change the "to" branch. 


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
				-> collections
				-> schemas
				-> helpers
				-> hooks
			-> lib 		*libraries for server side*
			-> server	*server side code*
				methods.coffee
				publications.coffee
			package.js *package declarations for meteor*
			

#Presentation layer

See [themes.md](themes.md) for details on the themes and LESS implementation.

	-> functionalTriad.less
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

#Logging
We use Bunyan for server logging https://github.com/trentm/node-bunyan. Client logging is standard Meteor client handling of `console.log`.

The ongoworks:bunyan package exports `loggers`, and is instianted by the `ReactionCore.Events` global that can be used anywhere in Reaction code.

To enable logging enable `isDebug: true`, or value can be any valid bunyan level in settings.json.

Setting a level of *debug*  `isDebug:  "debug"` or higher will display verbose logs as JSON. 

Note: *Recommend running meteor with `--raw-log` to remove most Meteor native console formatting. This is the default when you use `./bin/run` to start Meteor.*

Feel free to have verbose logging in the code, but use the following format [Bunyan recommendations on Levels](https://github.com/trentm/node-bunyan#levels)


```
The log levels in bunyan are as follows. The level descriptions are best practice opinions.

"fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
"error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
"warn" (40): A note on something that should probably be looked at by an operator eventually.
"info" (30): Detail on regular operation.
"debug" (20): Anything else, i.e. too verbose to be included in "info" level.
"trace" (10): Logging from external libraries used by your app or very detailed application logging.
Suggestions: Use "debug" sparingly. Information that will be useful to debug errors post mortem should usually be included in "info" messages if it's generally relevant or else with the corresponding "error" event. Don't rely on spewing mostly irrelevant debug messages all the time and sifting through them when an error occurs.
```

Example:
```

ReactionCore.Events.info "Something we want to see during development"

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

*common/collections/collections.coffee:*

```coffee
Product = ReactionCore.Collections.Product = new Mongo.Collection("Product")
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

