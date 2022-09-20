# reaction-error


[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/reaction-error.svg)](https://www.npmjs.com/package/@reactioncommerce/reaction-error)
[![CircleCI](https://circleci.com/gh/reactioncommerce/reaction-error.svg?style=svg)](https://circleci.com/gh/reactioncommerce/reaction-error)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Error handling for the Reaction API.

## How To Use

Note: _Be sure you are using NPM 5+_

First install in your project directory:

```bash
npm install @reactioncommerce/reaction-error
```

Import ReactionError in the file you wish to use it in

```js
import ReactionError from "@reactioncommerce/reaction-error";
```

## Releases

This NPM package is published automatically on every push to the `trunk` branch. Be sure to use proper Git commit messages so that the version will be bumped properly and release notes can be automatically generated.

- Refer to https://github.com/semantic-release/semantic-release#commit-message-format
- To avoid triggering a release, such as for a README-only change, include `[skip release]` in your commit message.
