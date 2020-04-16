# Reaction Commerce

[![Circle CI](https://circleci.com/gh/reactioncommerce/reaction.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction) [![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/reactioncommerce/reaction?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Open Source Helpers](https://www.codetriage.com/reactioncommerce/reaction/badges/users.svg)](https://www.codetriage.com/reactioncommerce/reaction)

[Reaction](http://reactioncommerce.com) is a headless commerce platform built using Node.js, React, and GraphQL. It plays nicely with npm, Docker and Kubernetes.

![Reaction Admin](https://user-images.githubusercontent.com/20409254/61161477-bb033c80-a4b8-11e9-9c5e-4f4f6a68b8d0.png)

# Getting started

Follow the documentation to install Reaction with [Reaction Platform](https://docs.reactioncommerce.com/docs/installation-reaction-platform) for all supported operating systems.

## Start App in Docker Container (Recommended)

```sh
bin/setup # do this after initial clone and after every pull or checkout
docker-compose up -d # starts a MongoDB container and a Reaction API container
docker-compose logs -f api # view Reaction API container logs
```

To stop the API and the MongoDB server, enter `docker-compose down`.

## Start App Without Docker (Not Recommended)

```sh
nvm use
# nvm install if prompted
npm i -g npm
npm install
bin/setup # do this after initial clone and after every pull or checkout
npm run start:dev
```

`CTRL+C` to stop.

## Run Integration Tests in Docker Container (Recommended)

```sh
bin/setup
docker-compose run --rm api npm run test:integration # Test all mutations and queries
docker-compose run --rm api npm run test:integration:query # OR test queries only
docker-compose run --rm api npm run test:integration:mutation # OR test mutations only
docker-compose run --rm api npm run test:integration:file:watch -- <filename> # OR test one file
```

`CTRL+C` to interrupt the test run.

## Run Integration Tests on Local Computer

```sh
docker-compose up -d mongo
npm install
npm run test:integration # Test all mutations and queries
npm run test:integration:query # OR test queries only
npm run test:integration:mutation # OR test mutations only
npm run test:integration:file:watch -- <filename> # OR test one file
```

`CTRL+C` to interrupt the test run.

# Build and Test a Production Image

Build:

```sh
docker build . -t test-api
```

Run:

```sh
dc up -d mongo
docker run --env-file ./.env -p 3000:3000 --network reaction.localhost -it test-api:latest
```

Use an external GraphQL client to test http://localhost:3000/graphql. GraphQL Playground isn't served on GET requests because it's in production mode.

# Get involved

## Tutorials, docs & developer tools

- [Developer documentation](https://docs.reactioncommerce.com)
- [Docs: Introduction to Reaction:  Concepts](https://docs.reactioncommerce.com/docs/concepts-intro)
- [Swag Shop Tutorial](https://docs.reactioncommerce.com/docs/swag-shop-1)
- [Storefront UI Development Tutorial](https://docs.reactioncommerce.com/docs/storefront-intro)
- [Storefront Component Library](http://designsystem.reactioncommerce.com/)
- [API documentation](http://api.docs.reactioncommerce.com)
- [Engineering blog posts](https://blog.reactioncommerce.com/tag/engineering/)

## Get help & contact the team

- [Gitter chat](https://gitter.im/reactioncommerce/reaction)
- Report security vulnerabilities to <mailto:security@reactioncommerce.com>: [Security reporting instructions](https://docs.reactioncommerce.com/reaction-docs/trunk/reporting-vulnerabilities)
- Request features in this [repository](https://github.com/reactioncommerce/reaction-feature-requests/)

## Contribute

:star: If you like what you see, star us on GitHub.

Find a bug, a typo, or something that’s not documented well? We’d love for you to [open an issue](https://github.com/reactioncommerce/reaction/issues) telling us what we can improve!

Want to request a feature? Use our [Reaction Feature Requests repository](https://github.com/reactioncommerce/reaction-feature-requests) to file a request.

We love your pull requests! Check our our [`Good First Issue`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) and [`Help Wanted`](https://github.com/reactioncommerce/reaction/issues?q=label%3A%22help+wanted%22) tags for good issues to tackle.

### Pull Request guidelines
Pull requests should pass all automated tests, style, and security checks.

Your code should pass all [acceptance tests and unit tests](https://docs.reactioncommerce.com/reaction-docs/trunk/testing-reaction). Run `docker-compose run --rm reaction npm run test` to run the test suites in containers. If you're adding functionality to Reaction, you should add tests for the added functionality.

We require that all code contributed to Reaction follows [Reaction's ESLint rules](https://github.com/reactioncommerce/reaction-eslint-config). You can run `docker-compose run --rm reaction npm run lint` to run ESLint against your code locally.

Please follow the [Reaction Code Style Guide](https://docs.reactioncommerce.com/docs/styleguide). Check out our guides to [JSDoc](https://docs.reactioncommerce.com/docs/jsdoc-style-guide), [Git](https://docs.reactioncommerce.com/docs/git-style-guide), [error handling](https://docs.reactioncommerce.com/docs/error-handling-guide), [logging](https://docs.reactioncommerce.com/docs/logging), and [React](https://docs.reactioncommerce.com/docs/react-best-practices).

We also request that you follow the our [pull request template](https://docs.reactioncommerce.com/docs/contributing-to-reaction#fill-out-the-pull-request-template)

Get more details in our [Contributing Guide](https://docs.reactioncommerce.com/docs/contributing-to-reaction).

### Developer Certificate of Origin
We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) in lieu of a Contributor License Agreement for all contributions to Reaction Commerce open source projects. We request that contributors agree to the terms of the DCO and indicate that agreement by signing-off all commits made to Reaction Commerce projects by adding a line with your name and email address to every Git commit message contributed:

```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

You can sign-off your commit automatically with Git by using `git commit -s` if you have your `user.name` and `user.email` set as part of your Git configuration.

We ask that you use your real full name (please no anonymous contributions or pseudonyms) and a real email address. By signing-off your commit you are certifying that you have the right to submit it under the [GNU GPLv3 License](./LICENSE.md).

We use the [Probot DCO GitHub app](https://github.com/apps/dco) to check for DCO sign-offs of every commit.

If you forget to sign-off your commits, the DCO bot will remind you and give you detailed instructions for how to amend your commits to add a signature.

### License
Reaction is [GNU GPLv3 Licensed](./LICENSE.md)
