# api-plugin-authentication

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-authentication.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-authentication)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-authentication.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-authentication)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Summary

This plugin provides Authentication middleware for the Reaction API. It relies on token based authentication.
Utils included in this plugin help connect the [Account-js](https://www.accountsjs.com/) library and the Reaction API via an Auth Token.

## How it works

This plugin registers the schema and resolvers that are required by account-js.

A express middleware is added whose job is to extract the `Authorization` header from the request and uses account-js to get the user for that token. The format should be `Authorization: Bearer <YOUR_ACCESS_TOKEN>`. Then the user is attached to the `req` object.

A function is added to `functionByType.graphQLContext` which links the graphQL context used in the api-core with the "internal context" used by account-js. This is needed because account-js also keeps tracks of the tokens and uses a separate GraphQL server.

## Supported actions

1. Signup
2. Login
3. Change Password
4. Forgot Password - A email is sent with a reset token url of the form `https://<STORE_URL>/?resetToken=<token>`

## Environment Variables:

| Variable Name | Description                                                                                                                     | Default Value           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| STORE_URL     | This is the public link to the storefront (used to redirect)                                                                    | `http://localhost:4000` |
| MONGO_URL     | MongoDB used to store session & tokens                                                                                          | None                    |
| TOKEN_SECRET  | [secret](https://www.accountsjs.com/docs/api/server/interfaces/accountsserveroptions#tokensecret) used while creating the token | `UPDATE_THIS_SECRET`    |

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
