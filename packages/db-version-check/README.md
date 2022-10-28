# @reactioncommerce/db-version-check

An NPM package that provides migrations for use with the `@reactioncommerce/migrator` CLI tool should use this package to check whether data is at the correct version before running any database commands.

## Usage

This package exports only one function: `doesDatabaseVersionMatch`.

```js
import doesDatabaseVersionMatch from "@reactioncommerce/db-version-check";

const ok = await doesDatabaseVersionMatch({
  // `db` is a Db instance from the `mongodb` NPM package,
  // such as what is returned when you do `client.db()`
  db,
  // These must match one of the namespaces and versions
  // your package exports in the `migrations` named export
  expectedVersion: 2,
  namespace: "my-package-name",
  // Defines what to do if no current version is found for this track in
  // the database. By default, the check will fail. That is, we will assume
  // that some data must need to be migrated. If you have a way of checking
  // whether it's an empty database or confirming that no migrations are
  // needed, you can do that and pass `true` here. Then the check will
  // succeed and the current version for the track will be set to
  // `expectedVersion`. Alternatively, pass a function that returns
  // a Promise that returns `true` or `false`. This way you can avoid
  // database lookups unless a decision is necessary.
  async setToExpectedIfMissing() {
    const anyAccount = await db.collection("Accounts").findOne();
    // If there are no accounts, it's probably a brand new database
    // so we can assume all our data will be at the latest version
    // and mark it as such in the database.
    return !anyAccount;
  }
});

if (!ok) {
  throw new Error('Database needs migrating. The "my-package-name" namespace must be at version 2.');
}
```

## Commit Messages

To ensure that all contributors follow the correct message convention, each time you commit your message will be validated with the [commitlint](https://www.npmjs.com/package/@commitlint/cli) package, enabled by the [husky](https://www.npmjs.com/package/husky) Git hooks manager.

## Publication to NPM

The `@reactioncommerce/db-version-check` package is automatically published by CI when commits are merged or pushed to the `trunk` branch.

## Developer Certificate of Origin
We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) in lieu of a Contributor License Agreement for all contributions to Reaction Commerce open source projects. We request that contributors agree to the terms of the DCO and indicate that agreement by signing-off all commits made to Reaction Commerce projects by adding a line with your name and email address to every Git commit message contributed:
```
Signed-off-by: Jane Doe <jane.doe@example.com>
```

You can sign-off your commit automatically with Git by using `git commit -s` if you have your `user.name` and `user.email` set as part of your Git configuration.

We ask that you use your real full name (please no anonymous contributions or pseudonyms) and a real email address. By signing-off your commit you are certifying that you have the right to submit it under the [Apache 2.0 License](./LICENSE).

We use the [Probot DCO GitHub app](https://github.com/apps/dco) to check for DCO sign-offs of every commit.

If you forget to sign-off your commits, the DCO bot will remind you and give you detailed instructions for how to amend your commits to add a signature.

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
