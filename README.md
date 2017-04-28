# Reaction

[![bitHound Overall Score](https://www.bithound.io/github/reactioncommerce/reaction/badges/score.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![bitHound Dev Dependencies](https://www.bithound.io/github/reactioncommerce/reaction/badges/devDependencies.svg)](https://www.bithound.io/github/reactioncommerce/reaction/9a858eb459d7260d5ae59124c2b364bc791a3e70/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/reactioncommerce/reaction/badges/code.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Reaction is an event-driven, real-time reactive commerce platform built with JavaScript (ES6). It plays nicely with npm and Docker, and is based entirely on JavaScript, CSS, and HTML. 

![Reaction v.1.0.0](https://raw.githubusercontent.com/reactioncommerce/reaction-docs/master/assets/rc-desktop.png)

## Features

Reaction’s out-of-the-box core features include:

* Drag-and-drop merchandising
* Order processing
* Payments
* Shipping
* Taxes
* Discounts
* Analytics
* Integration with dozens of third-party apps

And, since anything in our codebase can be extended, overwritten, or installed as a package, you may also develop, scale, and customize anything on our platform.

## Installation

**_reaction-cli installation_**

```bash
npm install -g reaction-cli
reaction init
cd reaction
reaction
```

_Reaction requires Meteor, Git, MongoDB, OS Specific Build Tools, and (optionally) ImageMagick. See our [Requirements Docs](https://docs.reactioncommerce.com/reaction-docs/master/requirements) for requirements installation information._

For more information on setup and configuration, check out the [installation](https://docs.reactioncommerce.com/reaction-docs/development/installation) and [configuration](https://docs.reactioncommerce.com/reaction-docs/development/configuration) docs.

## Participation

If you are interested in participating in the development of Reaction, that's really great!

Our [community guidelines](https://docs.reactioncommerce.com/reaction-docs/master/guidelines) can be found in our [documentation](https://docs.reactioncommerce.com/). This is a good place to start getting more familar with Reaction.

The [Reaction Gitter channel](https://gitter.im/reactioncommerce/reaction) and [forum](http://discourse.reactioncommerce.com/) are good places to engage with core contributors and the community.

### Planning

For a high level review our roadmap, take a look at the [Reaction features page](http://reactioncommerce.com/features).

For a kanban-esque, hardcore, real time progress overview of all Reaction Commerce projects use our [project board](https://waffle.io/reactioncommerce/reaction).

### Testing

Testing is another great way to contribute. If you do discover a bug, [create an issue](https://github.com/reactioncommerce/reaction/issues/new) to report it.

Integration tests can be run at the command line with `reaction test`. Use `npm run-script test-local` to run local tests.

### Documentation

The Reaction documentation source is located in the [reaction-docs](https://github.com/reactioncommerce/reaction-docs) repository, while the documentation site is the [reactioncommerce/redoc](https://github.com/reactioncommerce/redoc) application.


### Deployment

We require that all releases are deployable as [Docker](https://www.docker.com/) containers.  Athough we haven't tested out other methods of deployment, our community has documented deployment strategies for [Heroku](https://github.com/reactioncommerce/reaction/issues/1363), AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060), and Galaxy.

##### Docker

Docker images are pushed when Reaction sucessfully builds and passes all tests on the `master` or `development` branches. These images are released on [Reaction Commerce Docker Hub](https://hub.docker.com/u/reactioncommerce/). There are two images available: [reactioncommerce:prequel](https://hub.docker.com/r/reactioncommerce/prequel/) - the latest `development` image and [reactioncommerce:reaction](https://hub.docker.com/r/reactioncommerce/reaction/), the `master` image.


### Contributing

Want to contribute? That's great! [Here's how you can get started](https://guides.github.com/activities/contributing-to-open-source/#contributing).

Check out our Issues page, and if you find something you want to work on, let us know in the comments. If you're interested in a particular [project](https://github.com/reactioncommerce/reaction/projects) and you aren’t sure where to begin, feel free to ask. Start small!

If your contribution doesn't fit with an existing issue, go ahead and [create an issue](https://github.com/reactioncommerce/reaction/issues/new) before submitting a [Pull Request](https://help.github.com/articles/about-pull-requests/). This will allow the Reaction team to give feedback if necessary. 

Pull Requests should:

-   Include an associated issue
-   Comply with the Contributor License Agreement
-   Adhere to the [Reaction style guide](https://docs.reactioncommerce.com/reaction-docs/master/styleguide)
-   Pass both [acceptance tests and unit testing](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction)

Be sure to read our [Community Guidelines](https://docs.reactioncommerce.com/reaction-docs/master/guidelines) to get more familiar with Reaction. And if you have any questions or comments, feel free to reach out via [Gitter](https://gitter.im/reactioncommerce/reaction) or our [forums](http://discourse.reactioncommerce.com/). 

### What's Next

For an overview of our roadmap, visit our [Features & Roadmap page](https://reactioncommerce.com/roadmap). Or, if you'd like to see what we're doing in real time, check out our [Project Board](https://waffle.io/reactioncommerce/reaction). You can also see what we're doing [by project](https://github.com/reactioncommerce/reaction/projects) or [by release date](https://github.com/reactioncommerce/reaction/milestones).
