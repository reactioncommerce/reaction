# Reaction

[![bitHound Overall Score](https://www.bithound.io/github/reactioncommerce/reaction/badges/score.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![bitHound Dev Dependencies](https://www.bithound.io/github/reactioncommerce/reaction/badges/devDependencies.svg)](https://www.bithound.io/github/reactioncommerce/reaction/9a858eb459d7260d5ae59124c2b364bc791a3e70/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/reactioncommerce/reaction/badges/code.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Reaction is a modern reactive, real-time event driven ecommerce platform.

Reaction is built with JavaScript (ES6), Meteor, Node.js and works nicely with Docker.

![product-screens-2](https://cloud.githubusercontent.com/assets/439959/21865023/276a4bbe-d7f9-11e6-9525-3131ec43655b.png)

A Reaction installation provides analytics, shipping, payments, taxes, discounts, emails and social network login out of the box. Configuration just requires you to provide service credentials.

## Installation

**_reaction-cli installation_**

```bash
npm install -g reaction-cli
reaction init
cd reaction
reaction
```

Additional prerequisites, setup options and detailed installation documentation can be found in the [installation](https://docs.reactioncommerce.com/reaction-docs/development/installation) and [configuration documentation](https://docs.reactioncommerce.com/reaction-docs/development/configuration). Topics covered are Windows installation, setting up the default credentials, installation without `reaction-cli`, and pre-configuring packages.

## Participation

If you are interested in participating in the development of Reaction, that's really great!

Our [community guidelines](https://docs.reactioncommerce.com/reaction-docs/master/guidelines) can be found in our [documentation](https://docs.reactioncommerce.com/). This is a good place to start getting more familar with Reaction.

The [Reaction Gitter channel](https://gitter.im/reactioncommerce/reaction) and [forum](http://discourse.reactioncommerce.com/) are good places to engage with core contributors and the community.

### Planning

For a high level review our roadmap, take a look at the [Reaction features page](http://reactioncommerce.com/features).

For a kanban-esque, hardcore, real time progress overview of all Reaction Commerce projects use our [project board](https://waffle.io/reactioncommerce/reaction).

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

### Deployment

We require that all releases are deployable as [Docker](https://www.docker.com/) containers.  While we do not actively test or support other methods of deployment, the community has documented deployment strategies for [Heroku](https://github.com/reactioncommerce/reaction/issues/1363), AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060) and Galaxy.

##### Docker

Docker images are pushed when Reaction sucessfully builds and passes all tests on the `master` or `development` branches. These images are released on [Reaction Commerce Docker Hub](https://hub.docker.com/u/reactioncommerce/). There are two images available: [reactioncommerce:prequel](https://hub.docker.com/r/reactioncommerce/prequel/) - the latest `development` image and [reactioncommerce:reaction](https://hub.docker.com/r/reactioncommerce/reaction/), the `master` image.
