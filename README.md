<h1 align="center">
  Mailchimp Open Commerce (formerly Reaction Commerce)
</h1>

<h4 align="center">
  <a href="https://mailchimp.com/developer/open-commerce/">Open Commerce Website</a> |
  <a href="https://twitter.com/getreaction">Twitter</a> |
  <a href="https://mailchimp.com/developer/open-commerce/">Documentation</a> |
  <a href="https://discord.gg/Bwm63tBcQY">Discord</a>
</h4>

[Mailchimp Open Commerce](https://mailchimp.com/developer/open-commerce/) is an API-first, headless commerce platform built using Node.js, MongoDB, and GraphQL. It plays nicely with npm, Docker and Kubernetes.

![MOC Admin](https://user-images.githubusercontent.com/20409254/61161477-bb033c80-a4b8-11e9-9c5e-4f4f6a68b8d0.png)
# Getting started

For complete documentation go to [Open Commerce Quickstart](https://mailchimp.com/developer/open-commerce/guides/quick-start/) for all supported operating systems.

## What you need
 * git
 * [Docker](https://www.docker.com/)
 * [Docker Compose](https://docs.docker.com/compose/)
 * Windows users: [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10_) and [Docker for WSL](https://docs.docker.com/docker-for-windows/wsl/)

## Clone and Start the platform
```bash
git clone https://github.com/reactioncommerce/reaction-development-platform.git
cd reaction-development-platform
make
```

Behind the scenes, the make process clones all of the relevant Open Commerce software repositories, sets up each environment, and pulls, builds, and starts each Docker container.

When make completes, three services will be running on localhost:
* Open Commerce API (port 3000), including the core plugins. This service also contains the GraphQL playground at localhost:3000/graphql.
* Example Storefront (port 4000), which is built with Next.js.
* Admin dashboard (port 4080), used to manage shop settings, accounts, products, and orders.


Go to the complete [installation instructions](https://mailchimp.com/developer/open-commerce/guides/quick-start/#access-the-dashboard-playground-and-storefront) to see how to set up your store

# Get involved
## Contribute

:star: If you like what you see, star us on GitHub.

Find a bug, a typo, or something that’s not documented well? We’d love for you to [open an issue](https://github.com/reactioncommerce/reaction/issues) telling us what we can improve! This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/), please use their [commit message format](https://semantic-release.gitbook.io/semantic-release/#commit-message-format).

We love your pull requests! Check out our [`Good First Issue`](https://github.com/reactioncommerce/reaction/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) and [`Help Wanted`](https://github.com/reactioncommerce/reaction/issues?q=label%3A%22help+wanted%22) tags for good issues to tackle.
Check out our [contributors guide](CONTRIBUTING.md) for more information

### License

Reaction is [GNU GPLv3 Licensed](./LICENSE.md)
