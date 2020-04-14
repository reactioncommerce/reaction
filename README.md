# api-plugin-simple-schema

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-simple-schema.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-simple-schema)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-simple-schema.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-simple-schema)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Summary

Simple Schema plugin for the [Reaction API](https://github.com/reactioncommerce/reaction).

This plugin adds support for putting SimpleSchemas on context, so that other plugins can extend them.

## Usage

If you have a plugin in which you want to allow other plugins to extend one of your schemas, pass it to `registerPlugin`:

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

And on the other side, if you have a plugin that wants to extend some of the schemas provided by other plugins, do it in a `preStartup` function:

```js
export default function preStartup(context) {
  context.simpleSchemas.Product.extend({
    price: PriceRange
  });
}
```

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

