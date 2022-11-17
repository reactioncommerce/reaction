# api-plugin-fulfillment-method-shipping-flat-rate

This is a fulfillment-method plugin which which works along with the base `api-plugin-fulfillment` and the ff-type plugin `api-plugin-fulfillment-type-shipping`. This plugin actually implements all the functionality associated with this fulfillment-method. It can work along-side other fulfillment-methods under the same ff-type.

This main features/functionalities of this plugin includes the following:
* fulfillmentMethodsWithQuotesShippingFlatRate - returns the quote or equivalent details for the method when called from base ff plugin
* preStartup - extends the union of "methodAdditionalData" with data structure specific to FlatRate (dummy and can be changed)
* create/update/delete FlatRateFulfillmentMethods
* create/update/delete FlatRateFulfillmentRestrictions
* getFlatRateFulfillmentMethod(s) - deprecated
* getFlatRateFulfillmentRestriction(s) - deprecated
* flatRateFulfillmentMethod(s)
* flatRateFulfillmentRestriction(s)

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

