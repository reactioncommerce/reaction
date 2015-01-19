# reaction-core

`meteor add reactioncommerce:core`
---

See [Meteor Docs](http://docs.meteor.com) for introduction to [Meteor](http://meteor.com).

Read [Meteor Style Guide](https://github.com/meteor/meteor/wiki/Meteor-Style-Guide) for format and style of contributions.

Our core is being built with a preference for Coffeescript + LESS, but JavaScript is welcome in packages.

We try to always be using latest full release of all community packages.

# Developer Documentation

[Getting started guide](http://thoughts.reactioncommerce.com/how-to-get-involved-with-reaction-commerce/)

[Installation](https://github.com/ongoworks/reaction-core/blob/master/docs/installation.md)

[Guidelines](https://github.com/ongoworks/reaction-core/blob/master/docs/conventions.md)

[Methods](https://github.com/ongoworks/reaction-core/blob/master/docs/methods.md)

[Package Development](https://github.com/ongoworks/reaction-core/blob/master/docs/packages.md)

[Theme Development](https://github.com/ongoworks/reaction-core/blob/master/docs/themes.md)

[i18n Translations](https://github.com/ongoworks/reaction-core/blob/master/docs/i18n.md)

[Template Development](https://github.com/ongoworks/reaction-core/blob/master/docs/templates.md)

## Issues
For development tasks/issues please use the [Reaction project issues](https://github.com/ongoworks/reaction/issues?state=open). We're keeping this as the central issue tracking for all [reactioncommerce:*](https://github.com/reactioncommerce/) packages. You can also view issues on our [waffle board](https://waffle.io/reactioncommerce/reaction).

The default branch for reaction, reaction-core, reaction-core-theme is *development*. Pull requests made into the *development* branch, will be reviewed and merged into development for a quick release, while we work on specific feature branches separately, to be merged into *development*. 

We're trying to practice the art of liberally creating issues for every development task, rather than just 'community' bugs. This can be much noisier but we're trying to ensure we're publicly capturing and sharing all the tasks so everyone can have detailed insight into the project progress. 

The [help wanted](https://github.com/reactioncommerce/reaction/labels/help%20wanted) label calls out issues that prioritize where community member contributions would be relatively easy. Of course, all contributions are welcome.

The [ready](https://github.com/reactioncommerce/reaction/labels/ready) label groups issues that can be worked on immediately; requirements documentation should be complete (work to do on this). If you want to take ownership of one these [![Stories in Ready](https://badge.waffle.io/reactioncommerce/reaction.svg?label=ready&title=Ready)](http://waffle.io/reactioncommerce/reaction) issues, self assign it and change to "in progress" label when the item is actually being worked on, or comment in the issue.

Of course, [in progress](https://github.com/reactioncommerce/reaction/labels/in%20progress) labels are actively being worked on.

## Testing
We're testing a couple of [Velocity packages](http://velocity.meteor.com/). 

See: https://github.com/reactioncommerce/reaction/issues/241

* Feature branches can be merged and released when they are feature incomplete, but soon we're planning on enforcing a passing test written for every pull request.*


## Releases
We will merge development into master whenever an issue is marked done, and a PR has been submitted and accepted to development. No pull requests to `master` will be accepted.

`master` should always be a stable branch, but with a rapid merge cycle from `development`.  The [release](https://github.com/reactioncommerce/reaction/releases) and published packages will be tagged for minor release or higher, and sometimes for special case patches.


# Roadmap
For a high level review our roadmap, take a look at the vision page [Reaction Vision](http://reactioncommerce.com/vision)

For grouping of development channels by feature see project milestones: https://github.com/reactioncommerce/reaction/milestones *note: progress indicators highly volatile indicators at the moment*

And finally for the kanban-esque, hardcore real time progress view, take a look our [waffle board](https://waffle.io/reactioncommerce/reaction)




