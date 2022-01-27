# api-plugin-example

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-example.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-example)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-example.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-example)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Summary

This plugin provides a Boilerplate for creating an `npm` plugin for the [Reaction API](https://github.com/reactioncommerce/reaction).

The `Developer Certificate of Origin` and `License` sections can stay as they are, assuming `Apache 2` license is used (our preferred license). All other sections of this README should be updated to reflect your plugin.

## Included in this example plugin

### `.circleci/`

Adds CI scripts that enable Circle CI to run tests, lint, and semantic release your project. The `semantic-release` portions of the script are commented out, and should be uncommented in a PR once your plugin is ready to be released.

### `src/`

The `src` folder is where you'll put all the plugin files. An `index.js` with a bear-bones `registerPlugin` is included.

### `.gitignore`

A basic `gitignore` file

### `.nvmrc`

`.nvmrc` sets your plugin to use Node v12.14.1

### `babel.config.cjs`

If your plugin includes linting and tests, this file is required to allow esmodules to run correctly.

### `jest.config.cjs`

If your plugin includes tests, this file is required to allow esmodules to run correctly. You'll need to update the `transformIgnorePatterns` and `moduleNameMapper` sections to include any esmodule `npm` packages used in your plugin.

### `License.md`

If your plugin uses `Apache 2` licensing, you can leave this file as-is. If another type of licensing is used, you need to update this file, and the README, accordingly.

### `package.json`

The provided `package.json` is set up to install all needed packages and config for linting, testing, and semantic-release. You'll need to update the `name`, `description`, and add any new dependencies your plugin files use.

### `index.js`

The entrypoint file for your npm package, will most likely just export your plugin registration from the `src` folder.

## Developer Certificate of Origin
We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) in lieu of a Contributor License Agreement for all contributions to Reaction Commerce open source projects. We request that contributors agree to the terms of the DCO and indicate that agreement by signing all commits made to Reaction Commerce projects by adding a line with your name and email address to every Git commit message contributed:
```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

You can sign your commit automatically with Git by using `git commit -s` if you have your `user.name` and `user.email` set as part of your Git configuration.

We ask that you use your real name (please no anonymous contributions or pseudonyms). By signing your commit you are certifying that you have the right have the right to submit it under the open source license used by that particular Reaction Commerce project. You must use your real name (no pseudonyms or anonymous contributions are allowed.)

We use the [Probot DCO GitHub app](https://github.com/apps/dco) to check for DCO signoffs of every commit.

If you forget to sign your commits, the DCO bot will remind you and give you detailed instructions for how to amend your commits to add a signature.

## License

   Copyright 2020 Reaction Commerce

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

