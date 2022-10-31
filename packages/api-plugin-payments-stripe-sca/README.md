# api-plugin-payments-stripe-sca

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-payments-stripe-sca.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-payments-stripe-sca)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-payments-stripe-sca.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-payments-stripe-sca)

## Summary

Stripe Payments plugin for the [Reaction API](https://github.com/reactioncommerce/reaction) with support for SCA-compliant Stripe Payment Intents API

### Usage

1. Set the `STRIPE_API_KEY` environment variable in reaction API .env file with the private API key from Stripe.
2. Set the `STRIPE_PUBLIC_API_KEY` environment variable in the example-storefront .env file with the public API key from Stripe.
3. Restart containers.

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

   Copyright 2021 Reaction Commerce

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.