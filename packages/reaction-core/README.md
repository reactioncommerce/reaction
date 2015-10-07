# Reaction Core
[![Circle CI](https://circleci.com/gh/reactioncommerce/reaction-core.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction-core) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Reaction Core provides a core set of methods and templates for creating, connecting, and managing user carts, sessions, products, checkout and orders for Reaction Commerce.

```
meteor add reactioncommerce:core
```

If this is a newly created Meteor project:

```
meteor remove insecure
meteor remove autopublish
meteor add nemo64:bootstrap
meteor add reactioncommerce:bootstrap-theme
meteor add reactioncommerce:reaction-accounts
```

Create [client/themes/bootstrap/custom.reaction.json](https://github.com/reactioncommerce/reaction/blob/master/client/themes/bootstrap/custom.reaction.json) and [client/themes/bootstrap/custom.bootstrap.json](https://github.com/reactioncommerce/reaction/blob/master/client/themes/bootstrap/custom.bootstrap.json). These files configure the default LESS theme.

```
mkdir -p client/themes/bootstrap
curl -o client/themes/bootstrap/custom.bootstrap.json https://raw.githubusercontent.com/reactioncommerce/reaction/master/client/themes/bootstrap/custom.bootstrap.json
curl -o client/themes/bootstrap/custom.reaction.json https://raw.githubusercontent.com/reactioncommerce/reaction/master/client/themes/bootstrap/custom.reaction.json
```

## Packages
You can find a list of published packages on [Atmosphere](https://atmospherejs.com/?q=reactioncommerce)

## Developer Documentation
[Meteor Documentation](http://docs.meteor.com)

[Getting started guide](http://thoughts.reactioncommerce.com/how-to-get-involved-with-reaction-commerce/)

[Installation](https://github.com/ongoworks/reaction-core/blob/master/docs/installation.md)

[Guidelines](https://github.com/ongoworks/reaction-core/blob/master/docs/conventions.md)

[Methods](https://github.com/ongoworks/reaction-core/blob/master/docs/methods.md)

[Package Development](https://github.com/ongoworks/reaction-core/blob/master/docs/packages.md)

[Theme Development](https://github.com/ongoworks/reaction-core/blob/master/docs/themes.md)

[i18n Translations](https://github.com/ongoworks/reaction-core/blob/master/docs/i18n.md)

[Template Development](https://github.com/ongoworks/reaction-core/blob/master/docs/templates.md)

[Workflow](docs/workflow.md)

[Deploying](https://github.com/ongoworks/reaction-core/blob/master/docs/deploying.md)

## Roadmap
For a high level review our roadmap, take a look at the features page [Reaction Vision](http://reactioncommerce.com/features)

For grouping of development channels by feature see project milestones: [https://github.com/reactioncommerce/reaction/milestones](https://github.com/reactioncommerce/reaction/milestones)

And finally for the kanban-esque, hardcore real time progress view, take a look our [waffle board](https://waffle.io/reactioncommerce/reaction)

## Issues
For development tasks/issues please use the [Reaction project issues](https://github.com/reactioncommerce/reaction/issues?state=open). We're keeping this as the central issue tracking for all [reactioncommerce:*](https://github.com/reactioncommerce/) packages. You can also view issues on our [waffle board](https://waffle.io/reactioncommerce/reaction).
