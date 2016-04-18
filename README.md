# Reaction [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Code Climate](https://codeclimate.com/github/reactioncommerce/reaction/badges/gpa.svg)](https://codeclimate.com/github/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Reaction is a modern reactive, real-time event driven ecommerce platform.

Reaction is built with JavaScript (ES6), Meteor, Node.js and works nicely with Docker.

## Status
- 0.12.3 Master ( [stable](https://github.com/reactioncommerce/reaction/tree/master) )
- 0.13.0 Development ( [latest](https://github.com/reactioncommerce/reaction/tree/development) / [0.13.0](https://github.com/reactioncommerce/reaction/tree/development-v0.13) )

Reaction is expected to have a stable codebase ready for some production configurations within the next couple of major releases.  Be aware though, that we're updating frequently. Even existing structures that are functionally done are getting frequent updates to ensure we're current with the most current libraries available to us.

 Currently good for contributing, observing progress, and testing. We'd encourage due diligence in production usage, be very comfortable with the code, and risk tolerant. There are still many parts in development!

## Docs
Installation, configuration and development documentation is available on [docs.reactioncommerce.com](https://docs.reactioncommerce.com/)

The Reaction documentation source is located in the [reaction-docs](https://github.com/reactioncommerce/reaction-docs) repository, while the documentation site is the [reactioncommerce/redoc](https://github.com/reactioncommerce/redoc) application.

## Installation
> Reaction requires [Meteor](https://www.meteor.com/install), [Node](http://nodejs.org/), [npm](https://www.npmjs.com/) and [ImageMagick](http://www.imagemagick.org/script/binary-releases.php)

Developers using **Windows** should review the [Windows specific installation requirements for Meteor and Reaction](https://docs.reactioncommerce.com/reaction-docs/development/requirements).

```bash
curl https://install.meteor.com | /bin/sh # installs Meteor
git clone https://github.com/reactioncommerce/reaction.git
cd reaction
meteor npm install
./reaction
```

Additional setup options, such as how to set the default credentials, can be found in the  [installation](https://docs.reactioncommerce.com/reaction-docs/development/installation) and [configuration documentation](https://docs.reactioncommerce.com/reaction-docs/development/configuration).

_Note: When using a standalone MongoDB server, make sure you are using version 2.6 or later._

## Packages
Meteor [Atmosphere packages for Reaction](https://atmospherejs.com/?q=reaction)

Docker images are available on the [Docker Hub](https://hub.docker.com/u/reactioncommerce/).

## Roadmap
With ongoing feature development, and strong community contributions, we have a fluid roadmap.

For a high level review our roadmap, take a look at the [Reaction vision page](http://reactioncommerce.com/vision).

For grouping of development channels by feature, review the [project milestones](https://github.com/reactioncommerce/reaction/milestones).

And finally for the kanban-esque, hardcore real time progress overview of Reaction, take a look our [waffle board](https://waffle.io/reactioncommerce/reaction)

## Feedback
**Create a GitHub Issue** on the [Reaction project ](https://github.com/reactioncommerce/reaction) to report an issue.

Visit the **[Reaction discourse forum](http://discourse.reactioncommerce.com/)** to engage with the core team and community on new feature requests, or get community support with customization of Reaction.

Join us on our **[Gitter chat room](https://gitter.im/reactioncommerce/reaction)** to engage with other Meteor and Reaction users.
