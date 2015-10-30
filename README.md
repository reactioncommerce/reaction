# Reaction [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction-core.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Reaction is a modern reactive, real-time event driven ecommerce platform.

Reaction is built with JavaScript, Meteor, Node.js and works nicely with Docker.

See: [Atmosphere Packages for Reaction](https://atmospherejs.com/?q=reactioncommerce)

## Status
- 0.9.0 Master (beta 1)
- 0.10.0 Development
- 0.11.0 Next Stable Release

Currently good for contributing/observing progress, testing. It goes without saying that we're constantly refactoring, even things that are functionally done. We do not recommend using for production usage yet, unless you are very comfortable with the code, and aren't risk averse. There are still many parts in development!

## Installation

```
Node.js and NPM are required. Install from http://nodejs.org/
```

To install Meteor + Reaction, and start the latest release:

```bash
curl https://install.meteor.com | /bin/sh
git clone https://github.com/reactioncommerce/reaction.git
cd reaction && git checkout master
meteor
```

Additional installation options are in the [developer documentation](https://github.com/reactioncommerce/reaction/blob/development/docs/developer/installation.md).

_Note: for windows installation you also need:_
- OpenSSL x86 ([windows installer](https://slproweb.com/products/Win32OpenSSL.html))
- Visual Studio 2008 redistributables
- Git + msysGit ([git-for-windows/git](https://github.com/git-for-windows/git/releases))
- ImageMagick

If you want to use shell scripts under Windows:
- Create file named `meteor` inside `%localappdata%\.meteor` with following contents:
```
#!/bin/sh
cmd //c "$0.bat" "$@"
```
- Run shell scripts from `Git Bash`. For example:
```
cd reaction/
bin/clone-packages.sh
bin/reset
```

A Docker image is available on the [Reaction Commerce Docker Hub ](https://hub.docker.com/r/reactioncommerce/reaction/).

## Roadmap
As with all development, some items are ahead of schedule, and some are not. Here's how to get the details:

For a high level review our roadmap, take a look at the vision page [Reaction Vision](http://reactioncommerce.com/vision)

For grouping of development channels by feature see project milestones: [https://github.com/reactioncommerce/reaction/milestones](https://github.com/reactioncommerce/reaction/milestones)

And finally for the kanban-esque, hardcore real time progress view, take a look our [waffle board](https://waffle.io/reactioncommerce/reaction)

## Developer Documentation
[Getting started guide](http://blog.reactioncommerce.com/how-to-get-involved-with-reaction-commerce/)

[Installation](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/installation.md)

[Overview](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/overview.md)

[Methods](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/methods.md)

[Package Development](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/packages.md)

[Theme Development](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/themes.md)

[i18n Translations](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/i18n.md)

[Template Development](https://github.com/reactioncommerce/reaction/tree/master/docs/developer/templates.md)

### Code Repositories
Hey! Where's all the code!? Most of it is in the [reaction-core](https://github.com/reactioncommerce/reaction-core/) package...

We welcome pull requests to the latest `development` version branch.

# Feedback
**GitHub Issues** on the [Reaction](https://github.com/reactioncommerce/reaction) project are the best way to let us know about a feature request, or to report an issue.

Join us on our **[Gitter chat room](https://gitter.im/reactioncommerce/reaction)** to discuss, communicate, and share community support.
