# Reaction

[![bitHound Overall Score](https://www.bithound.io/github/reactioncommerce/reaction/badges/score.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![bitHound Dev Dependencies](https://www.bithound.io/github/reactioncommerce/reaction/badges/devDependencies.svg)](https://www.bithound.io/github/reactioncommerce/reaction/9a858eb459d7260d5ae59124c2b364bc791a3e70/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/reactioncommerce/reaction/badges/code.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![Code Climate](https://codeclimate.com/github/reactioncommerce/reaction/badges/gpa.svg)](https://codeclimate.com/github/reactioncommerce/reaction) [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Reaction is a modern reactive, real-time event driven ecommerce platform.

Reaction is built with JavaScript (ES6), Meteor, Node.js and works nicely with Docker.

## Installation

**_reaction-cli installation_**

```bash
npm install -g reaction-cli
reaction init
cd reaction
reaction
```

`reaction -v` provides useful version information you'll need for debugging if you have issues with `reaction`.

[ImageMagick](http://www.imagemagick.org/script/binary-releases.php) is optional, but required for transforming images for responsive sizing.

**Windows** users should review the [Windows specific installation requirements for Meteor and Reaction](https://docs.reactioncommerce.com/reaction-docs/development/requirements).

**reaction-cli** also requires a recent version of [npm](https://www.npmjs.com/).

You can use [npm](https://www.npmjs.com/) to update to the latest version.

```
npm i -g n
n stable
```

Additional setup options, such as how to set the default credentials, installation without `reaction-cli`, and [Meteor](https://www.meteor.com/install) installation can be found in the [installation](https://docs.reactioncommerce.com/reaction-docs/development/installation) and [configuration documentation](https://docs.reactioncommerce.com/reaction-docs/development/configuration).

![dashboard_and_new_tab](https://cloud.githubusercontent.com/assets/439959/17002746/a9fd1694-4e81-11e6-9963-28d6352787a3.png)

## Status

Reaction is expected to have a stable codebase ready for some production configurations within the next couple of major releases. Be aware though, that we're updating frequently. Even existing structures that are functionally done are getting frequent updates to ensure we're current with the most current libraries available to us.

Currently good for contributing, observing progress, and testing. We'd encourage due diligence in production usage, be very comfortable with the code, and risk tolerant. There are still many parts in development!

-   Master ( [stable](https://github.com/reactioncommerce/reaction/tree/master) )
-   Development ( [latest](https://github.com/reactioncommerce/reaction/tree/development) )

## Participation

If you are interested in participating in the development of Reaction, that's really great!

Our [community guidelines](https://docs.reactioncommerce.com/reaction-docs/master/guidelines) can be found in our [documentation](https://docs.reactioncommerce.com/). This is a good place to start getting more familar with Reaction.

The [Reaction Gitter channel](https://gitter.im/reactioncommerce/reaction) and [forum](http://discourse.reactioncommerce.com/) are good places to engage with core contributors and the community.


### Planning
For a high level review our roadmap, take a look at the [Reaction vision page](http://reactioncommerce.com/vision).

For a kanban-esque, hardcore, real time progress overview of all Reaction Commerce projects use our [waffle board](https://waffle.io/reactioncommerce/reaction).

Grouped by functional area, [reactioncommerce/reaction projects](https://github.com/reactioncommerce/reaction/projects) deliver a progress view of the Reaction sub-projects.

For grouping of issues with an estimated release schedule, review the [release milestones](https://github.com/reactioncommerce/reaction/milestones).

### Contributing

If you are planning on [contributing](https://guides.github.com/activities/contributing-to-open-source/#contributing) to Reaction, that's great. We welcome contributions to Reaction.

Explore the GitHub issues already opened. If you find something you want to work on, let us know right there in the comments. If you are interested in a specific aspect of the [project](https://github.com/reactioncommerce/reaction/projects) but aren’t sure where to begin, feel free to ask. Start small and open up a dialogue with us. This will help to get your contributions accepted easily.

If the contribution you wish to make isn't documented in an existing issue, please [create an issue](https://github.com/reactioncommerce/reaction/issues/new), before you submit a [Pull Request](https://help.github.com/articles/about-pull-requests/). This will allow the Reaction Maintainers and Collaborators a chance to give additional feedback as well.

[Pull Requests](https://help.github.com/articles/about-pull-requests/) should
-   Have an associated issue
-   Have accepted the Contributor License Agreement
-   Enforce the [Reaction style guide](https://docs.reactioncommerce.com/reaction-docs/master/styleguide)
-   Pass both [Acceptance tests and Unit testing](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction).


### Documentation

Installation, configuration and development documentation is available on [docs.reactioncommerce.com](https://docs.reactioncommerce.com/)

The Reaction documentation source is located in the [reaction-docs](https://github.com/reactioncommerce/reaction-docs) repository, while the documentation site is the [reactioncommerce/redoc](https://github.com/reactioncommerce/redoc) application.

### Testing

Testing is an important way of participating as well. If you do discover an issue, please create an [issue here](https://github.com/reactioncommerce/reaction/issues/new) to report an issue.

Integration tests can be run at the command line with `reaction test`. Use `npm run-script test-local` to run local tests.

We use [BrowserStack](https://www.browserstack.com) for automated acceptance testing.

![BrowserStack Logo](https://d98b8t1nnulk5.cloudfront.net/production/images/layout/logo-header.png?1469004780)

### Deployment
We require that all releases are deployable as [Docker](https://www.docker.com/) containers.  While we do not actively test or support other methods of deployment, the community has documented deployment strategies for [Heroku](https://github.com/reactioncommerce/reaction/issues/1363), AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060) and Galaxy.

##### Docker

Docker images are pushed when Reaction sucessfully builds and passes all tests on the `master` or `development` branches. These images are released on [Reaction Commerce Docker Hub](https://hub.docker.com/u/reactioncommerce/). There are two images available: [reactioncommerce:prequel](https://hub.docker.com/r/reactioncommerce/prequel/) - the latest `development` image and [reactioncommerce:reaction](https://hub.docker.com/r/reactioncommerce/reaction/), the `master` image.
