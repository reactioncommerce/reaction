# Issues
For development tasks/issues please use the [Reaction project issues](https://github.com/ongoworks/reaction/issues?state=open). We're keeping this as the central issue tracking for all [reactioncommerce:*](https://github.com/reactioncommerce/) packages. You can also view issues on our [waffle board](https://waffle.io/reactioncommerce/reaction).

The default branch for reaction, reaction-core, reaction-core-theme is *development*. Pull requests made into the *development* branch, will be reviewed and accepted into development for a quick release, while we work on specific feature branches separately, to be merged into *development*.

We're trying to practice the art of liberally creating issues for every development task, rather than just 'community' bugs. This can be much noisier but we're trying to ensure we're publicly capturing and sharing all the tasks so everyone can have detailed insight into the project progress.

The [help wanted](https://github.com/reactioncommerce/reaction/labels/help%20wanted) label calls out issues that prioritize where community member contributions would be relatively easy. Of course, all contributions are welcome.

The [ready](https://github.com/reactioncommerce/reaction/labels/ready) label groups issues that can be worked on immediately; requirements documentation should be complete (work to do on this). If you want to take ownership of one these [![Stories in Ready](https://badge.waffle.io/reactioncommerce/reaction.svg?label=ready&title=Ready)](http://waffle.io/reactioncommerce/reaction) issues, self assign it and change to "in progress" label when the item is actually being worked on, or comment in the issue.

Of course, [in progress](https://github.com/reactioncommerce/reaction/labels/in%20progress) labels are actively being worked on.

## Testing
We're testing a couple of [Velocity packages](http://velocity.meteor.com/).

See: https://github.com/reactioncommerce/reaction/issues/241

* Feature branches can be merged and released when they are feature incomplete, but soon we're planning on enforcing a passing test written for every pull request.*


## Releases
We will merge `development` into `master` whenever an issue is marked done, and a PR has been submitted and accepted to development. No pull requests to `master` will be accepted.

`master` should always be a stable branch, but with a rapid merge cycle from `development`.  The [release](https://github.com/reactioncommerce/reaction/releases) and published packages will be tagged for minor release or higher, and sometimes for special case patches.

## Pull Requests
Please make sure your pull requests are to the active `development` branch, no pull requests to `master` will be accepted. When you create a pull request, you can click the 'edit' button to change the "to" branch.

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

### template comments
Use of `{{!-- comment --}}` rather than `<!-- comment -->` is suggested, this isn't outputed in production.

#Logging
We use Bunyan for server logging https://github.com/trentm/node-bunyan. Client logging is standard Meteor client handling of `console.log`.

The ongoworks:bunyan package exports `loggers`, and is instantiated by the `ReactionCore.Events` global that can be used anywhere in Reaction code.

To enable logging set/add `isDebug: true` in `settings.json`.  Value can be any valid `bunyan level` in settings.json, or true/false.

Setting a level of *debug*  `isDebug:  "debug"` or higher will display verbose logs as JSON. The JSON format is also the storage / display format for production.

*Recommend running meteor with `--raw-log` to remove most Meteor native console formatting. This is the default when you use `./bin/run` to start Meteor.*

Feel free to include verbose logging, but follow [Bunyan recommendations on Levels](https://github.com/trentm/node-bunyan#levels) and use appropriate levels for your messages.


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

##Variable Scope & Namespaces

*common/packageGlobals.js:*

```js
// exported, global/window scope
ReactionCore = {};
ReactionCore.Schemas = {}; // Schemas defined in common/schemas
ReactionCore.Collections = {}; //Collections defined in common/collections
ReactionCore.Helpers = {}; //Misc.helpers defined in common/helpers
ReactionCore.MetaData = {}; // SEO, Metadata object
ReactionCore.Locale = {}; //i18n translation object
ReactionCore.Events = {}; // Logger instantiation (server)
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

