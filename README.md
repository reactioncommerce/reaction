# Reaction Commerce

[![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Open Source Helpers](https://www.codetriage.com/reactioncommerce/reaction/badges/users.svg)](https://www.codetriage.com/reactioncommerce/reaction)


[Reaction](http://reactioncommerce.com) is an event-driven, real-time reactive commerce platform built with JavaScript (ES6). It plays nicely with npm, Docker, and React.

![Reaction v.1.x](https://raw.githubusercontent.com/reactioncommerce/reaction-docs/v1.7.0/assets/Reaction-Commerce-Illustration-BG-800px.png)

## Features

Reaction’s out-of-the-box core features include:

-   Order processing
-   Payments
-   Shipping
-   Taxes
-   Discounts
-   Integration with dozens of third-party apps
-   See full list of features on our [Roadmap](https://reactioncommerce.com/roadmap)

Since anything in our codebase can be extended, overwritten, or installed as a package, you may also develop, scale, and customize anything on our platform.

# Getting started

### Requirements

Reaction requires Meteor, Git, MongoDB, OS-specific build tools and optionally, ImageMagick. For step-by-step instructions, follow the documentation for [OS X](https://docs.reactioncommerce.com/docs/next/installation-osx), [Windows](https://docs.reactioncommerce.com/docs/next/installation-windows) or [Linux](https://docs.reactioncommerce.com/docs/next/installation-linux).

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

Open `localhost:3000`

Learn more on how to [configure your project](https://docs.reactioncommerce.com/reaction-docs/master/configuration). Having installation issues? Check out our [troubleshooting docs](https://docs.reactioncommerce.com/docs/next/troubleshooting-development).

### Install and run using Docker

You can also run the app locally using [`docker-compose`](https://docs.docker.com/compose/) by running:

```sh
docker network create reaction-api
docker-compose up
```

This will use the `docker-compose.yml` file. This can be used to evaluate the app locally (on all systems supported by Docker),
however, for active local development or customization, it is better to run `reaction` outside of Docker for faster app builds.

To learn more on how to develop on Docker, read our documentation on [developing Reaction on Docker](https://docs.reactioncommerce.com/docs/next/installation-docker-development) and [troubleshooting Docker](https://docs.reactioncommerce.com/docs/next/troubleshooting-development#docker-issues).

# Get involved

## Documentation and tools

-   [Developer documentation](https://docs.reactioncommerce.com)
-   [API documentation](http://api.docs.reactioncommerce.com)
-   [Reaction GraphQL API server base](https://github.com/reactioncommerce/reaction-api-base)
-   [Reaction sample data](https://github.com/reactioncommerce/reaction-sample-data)


## Get help

-   [Reaction Commerce Gitter chat](https://gitter.im/reactioncommerce/reaction)
-   [Reaction Commerce forum](https://forums.reactioncommerce.com/)

## Learn

-   [Reaction Commerce engineering blog posts](https://blog.reactioncommerce.com/tag/engineering/)
-   [Customization themes & plugins tutorial](https://docs.reactioncommerce.com/reaction-docs/master/tutorial)
-   [Reaction Commerce YouTube videos](https://www.youtube.com/user/reactioncommerce/videos)

## Contact the team

-   [Security reporting instructions](https://docs.reactioncommerce.com/reaction-docs/master/reporting-vulnerabilities): Report security vulnerabilities to <mailto:security@reactioncommerce.com>.
-   [Reaction Action](https://www.youtube.com/playlist?list=PLJ1TVRVOrm2NOKlILTQFvtG7J9h1anvOe): RSVP for the monthly Reaction Action livestreams.

## Contribute

:star: Star us on GitHub — it helps!

We love your pull requests! Check our our [`Good First Issue`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) and [`Help Wanted`](https://github.com/reactioncommerce/reaction/issues?q=label%3A%22help+wanted%22) tags for good issues to tackle.

Pull requests should:

- Pass linting tests: Run `npm run lint` to make sure you're following the [Reaction Code Style Guide](https://docs.reactioncommerce.com/reaction-docs/master/styleguide).
- Pass acceptance and unit tests: Run `reaction test` to confirm both [acceptance tests and unit tests](https://docs.reactioncommerce.com/reaction-docs/master/testing-reaction) are passing
- Have a link to the issue.

Get more details in our [Contributing Guide](https://docs.reactioncommerce.com/reaction-docs/master/contributing-to-reaction).


## Deploy on Docker

We ensure that all releases are deployable as [Docker](https://hub.docker.com/r/reactioncommerce/reaction/) containers. While we don't regularly test other methods of deployment, our community has documented deployment strategies for AWS, [Digital Ocean](https://gist.github.com/jshimko/745ca66748846551692e24c267a56060), and Galaxy. For an introduction to Docker deployment, the [Reaction deployment guide](https://docs.reactioncommerce.com/reaction-docs/master/deploying) has detailed examples.

We've included a demo [docker-compose file](https://github.com/reactioncommerce/reaction/blob/master/docker-compose-demo.yml) in the repository.
It shows how to use `mongo` as a service with your Reaction app. It can be used to do a demo of your production build by running this command:

```sh
docker-compose -f docker-compose-demo.yml up
```

You can also use this file as starting point for your production docker-compose setup.

## See it in action

You can check our latest release in Heroku by simply clicking the button below. You will need to create a Heroku account if you do not have one yet or log in using an existing account.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### License

Copyright © [GNU General Public License v3.0](./LICENSE.md)
