##Conventions

This is a lot of the stuff you'll probably need to know, or at least reference, in order to contribute successfully to Reaction core development.

##Issues

For development tasks/issues please use the [Reaction project issues](https://github.com/ongoworks/reaction/issues?state=open). We're keeping this as the central issue tracking for all [reactioncommerce:*](https://github.com/reactioncommerce/) packages. You can also view issues on our [waffle board](https://waffle.io/reactioncommerce/reaction).

The default branch for reaction, reaction-core, reaction-core-theme is _development_. Pull requests made into the _development_ branch, will be reviewed and accepted into development for a quick release, while we work on specific feature branches separately, to be merged into _development_.

We're trying to practice the art of liberally creating issues for every development task, rather than just 'community' bugs. This can be much noisier but we're trying to ensure we're publicly capturing and sharing all the tasks so everyone can have detailed insight into the project progress.

The [help wanted](https://github.com/reactioncommerce/reaction/labels/help%20wanted) label calls out issues that prioritize where community member contributions would be relatively easy. Of course, all contributions are welcome.

The [ready](https://github.com/reactioncommerce/reaction/labels/ready) label groups issues that can be worked on immediately; requirements documentation should be complete (work to do on this). If you want to take ownership of one these [![Stories in Ready](https://badge.waffle.io/reactioncommerce/reaction.svg?label=ready&title=Ready)](http://waffle.io/reactioncommerce/reaction) issues, self assign it and change to "in progress" label when the item is actually being worked on, or comment in the issue.

Of course, [in progress](https://github.com/reactioncommerce/reaction/labels/in%20progress) labels are actively being worked on.

##Releases

We will publish packages, and merge `development` into `master`, whenever a major feature set becomes test-able.

No pull requests to `master` will be accepted.

`master` should always be a stable branch, but with a rapid merge cycle from `development`.  The [release](https://github.com/reactioncommerce/reaction/releases) and published packages will be tagged for minor release or higher, and sometimes for special case patches.

##Testing

We're using the Meteor testing framework [Velocity](http://velocity.meteor.com/). Velocity allows us to use different testing approaches as needed.  Currently we're using [Jasmine](https://github.com/Sanjo/meteor-jasmine) for the majority of tests.

Velocity doesn't always make it easy to test packages separately from the app. Velocity can also slow down the reload process during development while it's running tests in multiple cloned instances of the shop.

You can also test individual packages.

```
VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter package-to-test
```

As such, our testing falls into two locations:

####Reaction End to End Tests

   Located in the `reaction/tests/jasmine/client/integration` folder, these tests cover UIX testing. These are relatively fragile tests as they are only testing core theme and UIX.

   You enable these tests by uncommenting the velocity testing packages in `.meteor/packages`.

####Package integration Tests

   Tests for the individual reaction packages, are respectively located in `/tests/jasmine/server/integration`. Each package should cover tests  these tests cover UIX testing. These are relatively fragile tests as they are only testing core theme and UIX.

   These tests are run independently from the end to end tests, and can be run from the command line:

   `VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter package-to-test`

   To continuously test changes to the `core` package while using Reaction End to End tests simultaneously on another port:

```
   VELOCITY_TEST_PACKAGES=1 meteor test-packages --port 3006 reactioncommerce:core
```

Some Velocity setup tips:
- Uncomment `sanjo:jasmine` and the other testing packages found in the `/.meteor/packages` file in the Reaction path to use the browser testing console.
- You can set your `NODE_ENV` environment variable to 'development' to open up ports that velocity uses. The easiest way to do this is to run `export NODE_ENV="development"` before you start `meteor`
- If you run `meteor --test` your tests will only run once and will not re-run when you update files.

We'd like for new features to include at least basic integration test-coverage. If you are unsure about how to do this just ask and, we can point you in the right direction.
- Feature branches can be merged and released when they are feature incomplete, but soon we're planning on enforcing a passing test written for every pull request.*

_Writing tests is a great way to get to know the codebase a little better too._

[We've got an open issue on testing where any problems you run into while testing can go for now.](https://github.com/reactioncommerce/reaction/issues/241)

##Pull Requests

**Caution: your own research may be needed here, feedback is appreciated!**

Please make sure your pull requests are to the active `development` branch, no pull requests to `master` will be accepted. When you create a pull request, you can click the 'edit' button to change the "to" branch.

Please cleanup your PR into as few commits as possible (single is good).

In your branch:

```bash
git rebase -i origin/development
```

In the editor that opens, replace the words "pick" with "squash" next to the commits you want to squash into the commit before it(so all but the first one, for a single commit). Save and close the editor, and another editor instance will open the combined commit messages, tidy them up and save and close the editor.

If you need to edit the commit message later you can use

```bash
 git commit --amend
```

You can now `push` your branch to GitHub. If you've already published this branch, you should create a new branch, or use `--force` (rewrites history)

```bash
git push --force
```

Finally, [create a pull request](https://help.github.com/articles/creating-a-pull-request/) into the `development` branch of the appropriate reaction package.

##Style Guide

_A work in progress, but these are good guides._

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for ideas on format and style of contributions.

**event,template**

When using event, template parameters in methods, use full names

  'click': (event, template) ->

**comments** Use of `{{!-- comment --}}` rather than `<!-- comment -->` is suggested, as this isn't output in production.

###Presentation layer

See [themes.md](themes.md) for details on the themes and LESS implementation.

```
-> functionalTriad.less
        class="functional-triad-class" *hyphenated class names, replace camel casing*
        id="functional-triad-id"

    functionalTriad.html
        <template name="functionalTriad">

    functionalTriad.coffee
        Template.functionalTriad.helpers
        Template.functionalTriad.events
```

##Server Methods

See `core/server/methods/*` and `core/common/methods/*` source for reference.

###Variable Scope & Namespaces

_core/common/packageGlobals.js:_

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

_core/common/collections/products.js:_

```javascript
ReactionCore.Collections.Product = new Mongo.Collection("Product");
# etc...
```

The `reaction-core` package exports `ReactionCore`, on both client and server:

```js
api.export(["ReactionCore"]);
```

###Logging

[Bunyan](https://github.com/trentm/node-bunyan) provides a JSON friendly log handler in Reaction Core.

The ongoworks:bunyan package exports `loggers`, and is instantiated by the `ReactionCore.Events` global that can be used anywhere in Reaction code.

To enable logging set/add `isDebug: true` in `settings.json`.  Value can be any valid `bunyan level` in settings.json, or true/false.

Setting a level of _debug_  `isDebug:  "debug"` or higher will display verbose logs as JSON. The JSON format is also the storage / display format for production.

_Recommend running meteor with `--raw-log` to remove Meteor's default console formatting. This is the default when you use `./bin/run` to start Meteor._

Feel free to include verbose logging, but follow [Bunyan recommendations on log levels](https://github.com/trentm/node-bunyan#levels) and use appropriate levels for your messages.

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
