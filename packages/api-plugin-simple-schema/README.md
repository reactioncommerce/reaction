# api-plugin-simple-schema

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-simple-schema.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-simple-schema)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-simple-schema.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-simple-schema)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Summary

SimpleSchema plugin for the [Reaction API](https://github.com/reactioncommerce/reaction).

The [SimpleSchema](https://github.com/aldeed/simple-schema-js) package is used by many plugins to validate data, often before inserting or updating MongoDB documents. To allow other plugins to extend these schemas, some plugins register them such that they are accessible in a `preStartup` function.

## Installation

```sh
npm install @reactioncommerce/api-plugin-simple-schema
```

Then add a reference in `plugins.json`, using any key you want. The order in which plugins appear in this file is the order in which they load.

```json
{
  simpleSchema: "@reactioncommerce/api-plugin-simple-schema"
}
```

## Usage

Here's an example of registering a schema:

```js
import SimpleSchema from "simpl-schema";

const ProductSchema = new SimpleSchema({
  // ...
});

export default async function register(app) {
  await app.registerPlugin({
    // ...
    simpleSchemas: {
      Product: ProductSchema
    }
  });
}
```

Note that a plugin creating a SimpleSchema instance as in the above example will also need to list the `simpl-schema` NPM package as a dependency.

And on the other side, if you have a plugin that wants to extend some of the schemas provided by other plugins, do it in a `preStartup` function:

```js
export default function preStartup(context) {
  context.simpleSchemas.Product.extend({
    price: PriceRange
  });
}
```

This could be done in a `startup` function, but because startup code sometimes validates against these schemas, it's safer to do it in a `preStartup` function.

A plugin that extends schemas but never calls `new SimpleSchema()` anywhere need not list the `simpl-schema` NPM package as a dependency.

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

