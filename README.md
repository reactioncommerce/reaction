# Reaction [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Code Climate](https://codeclimate.com/repos/567089bf2f400828770006a6/badges/3a15e1b3cd1a4c546957/gpa.svg)](https://codeclimate.com/repos/567089bf2f400828770006a6/feed) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Reaction is a modern reactive, real-time event driven ecommerce platform.

Reaction is built with JavaScript (ES6), Meteor, Node.js and works nicely with Docker.

## Status
- 0.10.1 Master
- 0.11.0 Development (0.10.0 stability iteration)
- 0.12.0 New feature releases

Currently good for contributing/observing progress, testing. It goes without saying that we're constantly refactoring, even things that are functionally done. We'd encourage due diligence in production usage, be very comfortable with the code, and risk tolerant. There are still many parts in development!

## Installation

```
Node.js and NPM are required. Install from http://nodejs.org/
```

To install Meteor + Reaction, and start the latest release:

```bash
curl https://install.meteor.com | /bin/sh
git clone https://github.com/reactioncommerce/reaction.git
cd reaction && git checkout master # default branch is development
./reaction
```

Additional installation options are in the [developer documentation](https://github.com/reactioncommerce/reaction/blob/development/docs/developer/installation.md).

_Note: When using a standalone MongoDB server, make sure you are using version 2.6 or later._

_Note: for windows installation you also need:_
- OpenSSL x86 ([windows installer](https://slproweb.com/products/Win32OpenSSL.html))
- Visual Studio 2008 redistributables
- Git + msysGit ([git-for-windows/git](https://github.com/git-for-windows/git/releases))
- ImageMagick

If you want to use shell scripts under Windows:
- Create file named `meteor` inside `%localappdata%\.meteor` with following contents:
- !/bin/sh
- cmd //c "$0.bat" "$@"
- Run shell scripts from `Git Bash`. For example:
- cd reaction/
- bin/clone-packages.sh
- bin/reset

## Packages
 Atmosphere [Meteor Packages for Reaction](https://atmospherejs.com/?q=reaction)

Docker images are available on the [Docker Hub](https://hub.docker.com/u/reactioncommerce/).

## Roadmap
As with all development, some items are ahead of schedule, and some are not. Here's how to get the details:

For a high level review our roadmap, take a look at the vision page [Reaction Vision](http://reactioncommerce.com/vision)

For grouping of development channels by feature see project milestones: [https://github.com/reactioncommerce/reaction/milestones](https://github.com/reactioncommerce/reaction/milestones)

And finally for the kanban-esque, hardcore real time progress view, take a look our [waffle board](https://waffle.io/reactioncommerce/reaction)

## Developer Documentation
[Getting started guide](http://blog.reactioncommerce.com/how-to-get-involved-with-reaction-commerce/)

[Installation](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/installation.md)

[Overview](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/overview.md)

[Methods](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/methods.md)

[Package Development](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/packages.md)

[Theme Development](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/themes.md)

[i18n Translations](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/i18n.md)

[Workflow](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/workflow.md)

[Schemas](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/schema.md)

[Imports](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/import.md)

[Template Development](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/templates.md)

[Deploying](https://github.com/reactioncommerce/reaction/tree/development/docs/developer/deploying.md)

### Code Repositories
Hey! Where's all the code!?

Most of it is in now in the local `reaction/packages`.

Additional packages are also on [Atmosphere](https://atmospherejs.com/?q=reaction) and [GitHub](https://github.com/reactioncommerce/).

We welcome pull requests to the latest `development` version branch.

# Feedback
**GitHub Issues** on the [Reaction](https://github.com/reactioncommerce/reaction) project are the best way to let us know about a feature request, or to report an issue.

Join us on our **[Gitter chat room](https://gitter.im/reactioncommerce/reaction)** to discuss, communicate, and share community support.
