# api-plugin-sequences

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-sequences.svg)](https://www.npmjs.
com/package/@reactioncommerce/api-plugin-sequences)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-sequences.svg?style=svg)](https://circleci.
com/gh/reactioncommerce/api-plugin-sequences)

## Summary

Provides functionality for auto-incrementing integer IDs which is not natively supported by Mongo

## Usage

You can define a new sequence by declaring it in the `Sequences` of your plugin registraion

```javascript
    sequenceConfig: [
      {
        entity: "Promotions"
      }
    ]
```

This will create a sequence starting with 1000000 which can be incremented (returning the next to use) by calling
`context.mutations.incrementSequence(context, shopId, "YOUR_ENTITY_NAME")`;

If you wish to define the starting sequence you can do that by declaring an env var like:

```bash
SEQUENCE_INITIAL_VALUES={"Promotions":999}
```

Where you declare a one-line JSON object which contains any entities you want use a sequence for.

Sequences will be created on start-up and should be available to use immediately.


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
