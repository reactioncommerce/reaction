# Reaction Commerce

[![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Open Source Helpers](https://www.codetriage.com/reactioncommerce/reaction/badges/users.svg)](https://www.codetriage.com/reactioncommerce/reaction)

[Reaction](http://reactioncommerce.com) is an event-driven, real-time reactive commerce platform built with JavaScript (ES6). It plays nicely with npm, Docker, and React.

![Reaction v.1.x](https://raw.githubusercontent.com/reactioncommerce/reaction-docs/v1.7.0/assets/Reaction-Commerce-Illustration-BG-800px.png)

## Features

Reaction’s out-of-the-box core features include:

-	One-step cart and checkout
-   Order processing
-   Payments with Stripe
-   Shipping
-   Taxes
-   Multi-currency support
-   Discounts
-   Integration with dozens of third-party apps
-   See full list of features on our [roadmap](https://reactioncommerce.com/roadmap)

Since anything in our codebase can be extended, overwritten, or installed as a package, you may also develop, scale, and customize anything on our platform.

# Getting started

Follow the documentation to install Reaction with [Reaction Platform](https://docs.reactioncommerce.com/docs/installation-reaction-platform) for all operating systems.

> Installing an older version of Reaction? Follow the documentation for installing pre-2.0 Reaction on [OS X](https://docs.reactioncommerce.com/docs/1.16.0/installation-osx), [Windows](https://docs.reactioncommerce.com/docs/1.16.0/installation-windows) or [Linux](https://docs.reactioncommerce.com/docs/1.16.0/installation-linux).

# Get involved

## Read documentation & tutorials

-   [Reaction Commerce: Developer documentation](https://docs.reactioncommerce.com)
-   [Reaction Design System](http://designsystem.reactioncommerce.com/)
-   [Reaction Commerce: API documentation](http://api.docs.reactioncommerce.com)
-   [Reaction Commerce engineering blog posts](https://blog.reactioncommerce.com/tag/engineering/)
-   [Reaction Commerce YouTube videos](https://www.youtube.com/user/reactioncommerce/videos)

## Get help & contact the team

-   [Reaction Commerce Gitter chat](https://gitter.im/reactioncommerce/reaction)
-   [Reaction Commerce forum](https://forums.reactioncommerce.com/)
-   [Security reporting instructions](https://docs.reactioncommerce.com/reaction-docs/master/reporting-vulnerabilities): Report security vulnerabilities to <mailto:security@reactioncommerce.com>.

## Contribute

:star: Star us on GitHub — it helps!

Want to request a feature? Use our [Reaction Feature Requests repository](https://github.com/reactioncommerce/reaction-feature-requests) to file a request.

We love your pull requests! Check our our [`Good First Issue`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) and [`Help Wanted`](https://github.com/reactioncommerce/reaction/issues?q=label%3A%22help+wanted%22) tags for good issues to tackle.

Pull requests should:

- Pass all Circle CI checks: 
    - Run `docker-compose run --rm reaction npm run lint` to make sure your code follows [Reaction's ESLint rules](https://github.com/reactioncommerce/reaction-eslint-config).
    - Run `docker-compose run --rm reaction reaction test` to run [acceptance tests and unit tests](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction).
    - Make sure you're following the [Reaction Code Style Guide](https://docs.reactioncommerce.com/reaction-docs/master/styleguide) and 
- Follow the pull request template.

Get more details in our [Contributing Guide](https://docs.reactioncommerce.com/reaction-docs/master/contributing-to-reaction).

## Deploy on Docker

We ensure that all releases are deployable as [Docker](https://hub.docker.com/r/reactioncommerce/reaction/) containers. While we don't regularly test other methods of deployment, our community has documented deployment strategies for AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060), and Galaxy. For an introduction to Docker deployment, the [Reaction deployment guide](https://docs.reactioncommerce.com/reaction-docs/master/deploying) has detailed examples.

We've included a demo [docker-compose file](https://github.com/reactioncommerce/reaction/blob/master/docker-compose-demo.yml) in the repository.
It shows how to use `mongo` as a service with your Reaction app. It can be used to do a demo of your production build by running this command:

```sh
docker-compose -f docker-compose-demo.yml up
```

You can also use this file as starting point for your production docker-compose setup.

### License

Copyright © [GNU General Public License v3.0](./LICENSE.md)
