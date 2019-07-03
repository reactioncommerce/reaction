# Reaction Commerce

[![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Open Source Helpers](https://www.codetriage.com/reactioncommerce/reaction/badges/users.svg)](https://www.codetriage.com/reactioncommerce/reaction)

[Reaction](http://reactioncommerce.com) is an API-first, headless commerce platform built using Node.js, React, and GraphQL. It plays nicely with npm, Docker and Kubernetes.

This project is no longer a customer-facing storefront—it's a **commerce operator tool** that connects with a frontend via a GraphQL API. The Reaction application is coordinated with [Reaction Platform](https://github.com/reactioncommerce/reaction-platform) and is designed to work with the [Example Storefront](https://github.com/reactioncommerce/example-storefront) (previously Storefront Starter Kit) and [reaction-hydra](https://github.com/reactioncommerce/reaction-hydra).

![Reaction v.2.x](/public/resources/Reaction2.0_Catalyst.png "Reaction 2.0 Catalyst")
## Features

Reaction comes with a robust set of core commerce capabilities right out of the box. And since anything in our codebase can be extended, overwritten, or installed as a package, you may also develop, scale, and customize anything on our platform.

Check out the full list of Reaction [features](https://www.reactioncommerce.com/features) and [version releases](https://reactioncommerce.com/roadmap) for more info.


# Getting started

Follow the documentation to install Reaction with [Reaction Platform](https://docs.reactioncommerce.com/docs/installation-reaction-platform) for all supported operating systems.


# Get involved

## Tutorials, docs & developer tools

- [Developer documentation](https://docs.reactioncommerce.com)
- [Docs: Introduction to Reaction:  Concepts](https://docs.reactioncommerce.com/docs/concepts-intro)
- [Swag Shop Tutorial](https://docs.reactioncommerce.com/docs/swag-shop-1)
- [Storefront UI Development Tutorial](https://docs.reactioncommerce.com/docs/storefront-intro)
- [Reaction Design System](http://designsystem.reactioncommerce.com/)
- [API documentation](http://api.docs.reactioncommerce.com)
- [Engineering blog posts](https://blog.reactioncommerce.com/tag/engineering/)


## Get help & contact the team

- [Gitter chat](https://gitter.im/reactioncommerce/reaction)
- Report security vulnerabilities to <mailto:security@reactioncommerce.com>: [Security reporting instructions](https://docs.reactioncommerce.com/reaction-docs/master/reporting-vulnerabilities)
- Request features in this [repository](https://github.com/reactioncommerce/reaction-feature-requests/)

## Contribute

:star: If you like what you see, star us on GitHub.

Find a bug, a typo, or something that’s not documented well? We’d love for you to [open an issue](https://github.com/reactioncommerce/reaction/issues) telling us what we can improve!

Want to request a feature? Use our [Reaction Feature Requests repository](https://github.com/reactioncommerce/reaction-feature-requests) to file a request.

We love your pull requests! Check our our [`Good First Issue`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) and [`Help Wanted`](https://github.com/reactioncommerce/reaction/issues?q=label%3A%22help+wanted%22) tags for good issues to tackle.

Pull requests should:

- Pass all Circle CI checks:
  - Run `docker-compose run --rm reaction npm run lint` to make sure your code follows [Reaction's ESLint rules](https://github.com/reactioncommerce/reaction-eslint-config).
  - Run `docker-compose run --rm reaction reaction test` to run [acceptance tests and unit tests](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction).
  - Make sure you're following the [Reaction Code Style Guide](https://docs.reactioncommerce.com/docs/styleguide). Check out our guides to [JSDoc](https://docs.reactioncommerce.com/docs/jsdoc-style-guide), [Git](https://docs.reactioncommerce.com/docs/git-style-guide), [error handling](https://docs.reactioncommerce.com/docs/error-handling-guide), [logging](https://docs.reactioncommerce.com/docs/logging), and [React](https://docs.reactioncommerce.com/docs/react-best-practices).
-  We request that you follow the [pull request template](https://docs.reactioncommerce.com/docs/contributing-to-reaction#fill-out-the-pull-request-template)
- Please make sure to sign off all commits with the [Developer Certificate of Origin](https://probot.github.io/apps/dco/)

Get more details in our [Contributing Guide](https://docs.reactioncommerce.com/docs/contributing-to-reaction).



### License

Copyright © [GNU General Public License v3.0](./LICENSE.md)
