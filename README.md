# @reactioncommerce/migrator-version-check

An NPM package that provides migrations for use with the `@reactioncommerce/migrator` CLI tool should use this package to check whether data is at the correct version before running any database commands.

## Usage

This package exports only one function: `doesDatabaseVersionMatch`.

```js
import doesDatabaseVersionMatch from "@reactioncommerce/migrator-version-check";

const ok = await doesDatabaseVersionMatch({
  // `db` is a Db instance from the `mongodb` NPM package,
  // such as what is returned when you do `client.db()`
  db,
  // These must match one of the namespaces and versions
  // your package exports in the `migrations` named export
  expectedVersion: 2,
  namespace: "my-package-name"
});

if (!ok) {
  throw new Error('Database needs migrating. The "my-package-name" namespace must be at version 2.');
}
```

## Commit Messages

To ensure that all contributors follow the correct message convention, each time you commit your message will be validated with the [commitlint](https://www.npmjs.com/package/@commitlint/cli) package, enabled by the [husky](https://www.npmjs.com/package/husky) Git hooks manager.

Examples of commit messages: https://github.com/semantic-release/semantic-release

## Publication to NPM

The `@reactioncommerce/migrator-version-check` package is automatically published by CI when commits are merged or pushed to the `master` branch. This is done using [semantic-release](https://www.npmjs.com/package/semantic-release), which also determines version bumps based on conventional Git commit messages.

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
