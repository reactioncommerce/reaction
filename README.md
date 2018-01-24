# Reaction Commerce

[![bitHound Overall Score](https://www.bithound.io/github/reactioncommerce/reaction/badges/score.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![bitHound Dev Dependencies](https://www.bithound.io/github/reactioncommerce/reaction/badges/devDependencies.svg)](https://www.bithound.io/github/reactioncommerce/reaction/9a858eb459d7260d5ae59124c2b364bc791a3e70/dependencies/npm) [![bitHound Code](https://www.bithound.io/github/reactioncommerce/reaction/badges/code.svg)](https://www.bithound.io/github/reactioncommerce/reaction) [![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Reaction](http://reactioncommerce.com) is an event-driven, real-time reactive commerce platform built with JavaScript (ES6). It plays nicely with npm, Docker, and React.

![Reaction v.1.x](https://raw.githubusercontent.com/reactioncommerce/reaction-docs/master/assets/Reaction-Commerce-Illustration-BG-800px.png)

## Features

Reaction’s out-of-the-box core features include:

- Drag-and-drop merchandising
- Order processing
- Payments
- Shipping
- Taxes
- Discounts
- Analytics
- Integration with dozens of third-party apps
- See full list of features on our [Roadmap](https://reactioncommerce.com/roadmap)

Since anything in our codebase can be extended, overwritten, or installed as a package, you may also develop, scale, and customize anything on our platform.

# Getting started

### Requirements

Reaction requires Meteor, Git, MongoDB, OS-specific build tools and optionally, ImageMagick. For step-by-step instructions, check out this [page](https://docs.reactioncommerce.com/reaction-docs/master/installation).

### Install and create your first store

Install the [Reaction CLI](https://github.com/reactioncommerce/reaction-cli) to get started with Reaction:
```bash
npm install -g reaction-cli
```

Create your store:
```bash
reaction init
cd reaction
reaction
```

Learn more on how to [configure your project](https://docs.reactioncommerce.com/reaction-docs/master/configuration).

# Get involved

## Documentation and tools
- [Developer documentation](https://docs.reactioncommerce.com)
- [API documentation](http://api.docs.reactioncommerce.com) 
- [Reaction component style guide](https://styleguide.reactioncommerce.com/)
- [Reaction GraphQL API server base](https://github.com/reactioncommerce/reaction-api-base)
- [Reaction sample data](https://github.com/reactioncommerce/reaction-sample-data)

## Get help
- [Reaction Commerce Gitter chat](https://gitter.im/reactioncommerce/reaction)
- [Reaction Commerce forum](https://forums.reactioncommerce.com/)

## Learn
- [Reaction Commerce engineering blog posts](https://blog.reactioncommerce.com/tag/engineering/)
- [Customization themes & plugins tutorial](https://docs.reactioncommerce.com/reaction-docs/master/tutorial)
- [Reaction Commerce YouTube videos](https://www.youtube.com/user/reactioncommerce/videos)

## Join the community calls
- [Reaction community calls](http://getrxn.io/2rcCal): Join our biweekly community calls every other Wednesday at 7AM PST/10AM EST. 
- Subscribe to our [Reaction Community Google Calendar](http://getrxn.io/2rcCal) to RSVP to the next call and check out the [agenda](https://docs.google.com/document/d/1PwenrammgQJpQfFoUUJZ96i_JJYCM_4glAjB1_ZzgwA/edit?usp=sharing).
- [Reaction Action](http://getrxn.io/2rcCal): RSVP for the monthly Reaction Action livestreams.

## Contribute

:star: Star us on GitHub — it helps!

We love your pull requests! Check our our [`Pull Requests Encouraged`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aissue+is%3Aopen+label%3Apull-requests-encouraged) issues tag for good issues to tackle.

Pull requests should:

- Pass linting tests: Run `eslint .` to make sure you're following the [Reaction Commerce coding  guide](https://docs.reactioncommerce.com/reaction-docs/master/styleguide).
- Pass acceptance and unit tests: Run `reaction test` to confirm both [acceptance tests and unit tests](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction) are passing
- Have a link to the issue.

Get more details in our [Contributing guide](https://github.com/reactioncommerce/reaction/blob/master/CONTRIBUTING.md).

# Reaction Platform

## Deploy on Docker

We ensure that all releases are deployable as [Docker](https://hub.docker.com/r/reactioncommerce/reaction/) containers. While we don't regularly test other methods of deployment, our community has documented deployment strategies for AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060), and Galaxy. For an introduction to Docker deployment, the [Reaction deployment guide](https://docs.reactioncommerce.com/reaction-docs/master/deploying) has detailed examples. 

## Reaction Platform

We also offer [Reaction Platform](https://reactioncommerce.com/hosting), a managed deployment platform integrated with the Reaction command line. 

### License

Copyright © [GNU General Public License v3.0](./LICENSE.md)
