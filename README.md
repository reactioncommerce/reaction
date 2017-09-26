# Reaction

[![bitHound Overall Score](https://www.bithound.io/github/reactioncommerce/reaction/badges/score.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![bitHound Dev Dependencies](https://www.bithound.io/github/reactioncommerce/reaction/badges/devDependencies.svg)](https://www.bithound.io/github/reactioncommerce/reaction/9a858eb459d7260d5ae59124c2b364bc791a3e70/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/reactioncommerce/reaction/badges/code.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Reaction is an event-driven, real-time reactive commerce platform built with JavaScript (ES6). It plays nicely with npm and Docker, and is based entirely on JavaScript, CSS, and HTML.

![Reaction v.1.0.0](https://raw.githubusercontent.com/reactioncommerce/reaction-docs/master/assets/rc-desktop.png)

## Features

Reaction’s out-of-the-box core features include:

-   Drag-and-drop merchandising
-   Order processing
-   Payments
-   Shipping
-   Taxes
-   Discounts
-   Analytics
-   Integration with dozens of third-party apps

Since anything in our codebase can be extended, overwritten, or installed as a package, you may also develop, scale, and customize anything on our platform.

## Installation

**_reaction-cli installation_**

```bash
npm install -g reaction-cli
reaction init
cd reaction
reaction
```

Reaction requires Meteor, Git, MongoDB, OS Specific Build Tools, and (optionally) ImageMagick.

See our [Requirements Docs](https://docs.reactioncommerce.com/reaction-docs/master/requirements) for requirements that you may need to install for Reaction.

For more information on setup and configuration, check out the [installation](https://docs.reactioncommerce.com/reaction-docs/development/installation) and [configuration](https://docs.reactioncommerce.com/reaction-docs/development/configuration) docs.

### Planning

For an overview of our roadmap, visit our [Features & Roadmap page](https://reactioncommerce.com/roadmap).

You will find the roadmap defined as projects on the [Reaction repository's project page](https://github.com/reactioncommerce/reaction/projects).

Specific features in progress are found on the [Reaction repository's milestones page](https://github.com/reactioncommerce/reaction/milestones).

### Documentation

Multiple branches, release documentation is found at <https://docs.reactioncommerce.com>

The Reaction documentation source is located in the [reaction-docs](https://github.com/reactioncommerce/reaction-docs) repository, while the documentation site is the [reactioncommerce/redoc](https://github.com/reactioncommerce/redoc) application.

### Community

There are many ways to get connected with the Reaction core team and community:

-   [Reaction Commece Gitter chat](https://gitter.im/reactioncommerce/reaction)
-   [Reaction Commerce forum](https://forums.reactioncommerce.com/)
-   [Reaction Community calls](http://getrxn.io/2rcCal): Join our biweekly community calls every other Wednesday at 7AM PST/10AM EST. Subscribe to our [Reaction Community Google Calendar](http://getrxn.io/2rcCal) to RSVP to the next call and check out the [agenda](https://docs.google.com/document/d/1PwenrammgQJpQfFoUUJZ96i_JJYCM_4glAjB1_ZzgwA/edit?usp=sharing).
-   [Reaction Action](http://getrxn.io/2rcCal): RSVP for the monthly Reaction Action livestreams.

Our [community guidelines](https://docs.reactioncommerce.com/reaction-docs/master/guidelines) can be found in our [documentation](https://docs.reactioncommerce.com/).

### Contributing

Star us on GitHub, it helps!

If you are interested in participating in the development of Reaction, that's  great! Check out the [issues](https://github.com/reactioncommerce/reaction/issues) page, starting with the [`Pull Requests Encouraged`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aissue+is%3Aopen+label%3Apull-requests-encouraged) and [`Verified Reproducible`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aopen+is%3Aissue+label%3Averified-reproducible) labeled issues. If you find something you want to work on, let us know in the issue comments.

If you're interested in a particular [project](https://github.com/reactioncommerce/reaction/projects), like [Marketplace](https://github.com/reactioncommerce/reaction/projects/9) and you aren’t sure where to begin, feel free to ask a core team member in the corresponding project [forum](https://gitter.im/reactioncommerce/home).

If your contribution doesn't fit with an existing issue, go ahead and [create an issue](https://github.com/reactioncommerce/reaction/issues/new) before submitting a [Pull Request](https://help.github.com/articles/about-pull-requests/). This will allow the Reaction team to give feedback if necessary.

Pull Requests should:

-   Be very focused in scope. Smaller scopes are easier for us to digest and approve.
-   Note any existing associated issues.
-   Lint and adhere to the [Reaction style guide](https://docs.reactioncommerce.com/reaction-docs/master/styleguide).
-   Pass both [acceptance tests and unit testing](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction).

### Testing

Testing is another great way to contribute. If you do discover a bug, [create an issue](https://github.com/reactioncommerce/reaction/issues/new) to report it.

Integration tests can be run at the command line with `reaction test`.

### Deployment

We ensure that all releases are deployable as [Docker](https://www.docker.com/) containers.  While we don't regularly test other methods of deployment, our community has documented deployment strategies for AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060), and Galaxy.

For an introduction to Docker deployment, [the Reaction deployment guide](https://docs.reactioncommerce.com/reaction-docs/master/deploying) has detailed examples. Reaction Commerce also offers a managed deployment platform integrated with the Reaction command line.

### License

Copyright © [GNU General Public License v3.0](./LICENSE.md)
