# api-plugin-products

[![npm (scoped)](https://img.shields.io/npm/v/@reactioncommerce/api-plugin-products.svg)](https://www.npmjs.com/package/@reactioncommerce/api-plugin-products)
[![CircleCI](https://circleci.com/gh/reactioncommerce/api-plugin-products.svg?style=svg)](https://circleci.com/gh/reactioncommerce/api-plugin-products)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Summary

Products plugin for the [Reaction API](https://github.com/reactioncommerce/reaction)

### Example on how to use Filter Conditions

We have a query endpoint defined in this plugin which allows us to query products collection based on the input GraphQL conditions object. This query endpoint is defined as `filterProducts.js` and it calls the `generateFilterQuery` function from the `api-utils` plugin to generate the MongoDB filter query.

The `generateFilterQuery` function expects the input GraphQL conditions object to be in the format of the `FilterConditionsInput` input type defined in the GraphQL Schemas (in api-core plugin) along with other parameters like `context`, `collectionName` and `shopId`.

Please go through a general introduction of how to use this function which can be found in the [api-utils README](https://github.com/reactioncommerce/reaction/tree/trunk/packages/api-utils/docs) before going through the examples below on how to use this function in the context of the `products` plugin.

In the query endpoint, we pass the `FilterConditionsInput` input type object as the `conditions` argument. This object is passed to the `generateFilterQuery` function along with other parameters like `context`, `collectionName` and `shopId` to generate the MongoDB filter query. The `generateFilterQuery` function is generic and can be used to generate filter queries for any collection. Since the parametes like `context`, `collectionName` and `shopId` are pretty self-explanatory, we shall focus on explaining the various ways in which the `conditions` object can be used.

1. Single condition.
Here we are querying products collection for entries with the handle as 'mens-waterproof-outdoor-rain-jacket'. Since it is single condition, using either `all` or `any` will not make difference. 

```js
import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

const conditions = {
      all: [
        {
          any:[
            {
              key: "handle",
              stringValue: "mens-waterproof-outdoor-rain-jacket",
              relationalOperator: eq,
              logicalNot: false
            }
          ]
        }
      ]
    }

  const { filterQuery } = generateFilterQuery(context, "Product", conditions, shopId);

  return Products.find(filterQuery);
```
<br>

2. Two conditions.

Here we are querying products collection for entries which have either the handle as 'mens-waterproof-outdoor-rain-jacket' or 'title' begins with the text 'men'. Since we are using the `any` to connect the conditions, it translates to a mongo DB `$or` condition. Please note that the top level `all` condition is only to maintain the structure of the input GraphQL conditions object. It does not impact the results of the inner query.


```js
import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

const conditions = {
      all: [
        {
          any:[
            {
              key: "handle",
              stringValue: "mens-waterproof-outdoor-rain-jacket",
              relationalOperator: eq,
              logicalNot: false
            }, 
            {
              key: "title",
              stringValue: "men",
              relationalOperator: beginsWith,
              logicalNot: false
              caseSensitive: false
            }
          ]
        }
      ]
    }

  const { filterQuery } = generateFilterQuery(context, "Product", conditions, shopId);

  return Products.find(filterQuery);
```
<br>

3. Multiple conditions.

Here we are querying products collection for entries which confirms to multiple conditions.
We have 3 distinct group of conditions in the inner level and the results of all these 3 are joined at the top level with `all` meaning `$and` in MongoDB.

The first group looks for entries matching either of the conditions `handle` as 'mens-waterproof-outdoor-rain-jacket' or `title` begins with the text 'men'. Since we are using the `any` to connect the conditions, it translates to a mongo DB `$or` condition.

The second group looks for entries matching the `_id` in the array `["DZwLHk4EAzitRni8F", "Hn4BRaBvLkYffMq36"]` and `isDeleted` as `false` and `workflow.status` as `new`. Since we are using the `all` to connect the conditions, it translates to a mongo DB `$and` condition.

The third group looks for entries matching the `price.min` greater than 19.99 and `type` as `simple`. Since we are using the `all` to connect the conditions, it translates to a mongo DB `$and` condition.

As explained above, the final results are joined at the top level with `all` meaning `$and` in MongoDB.

```js
import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

const conditions = {
      all: [
        {
          any:[
            {
              key: "handle",
              stringValue: "mens-waterproof-outdoor-rain-jacket",
              relationalOperator: eq,
              logicalNot: false
            }, 
            {
              key: "title",
              stringValue: "men",
              relationalOperator: beginsWith,
              logicalNot: false
              caseSensitive: false
            }
          ]
        },
        {
          all:[
            {
              key: "_id",
              stringArrayValue: ["DZwLHk4EAzitRni8F", "Hn4BRaBvLkYffMq36"],
              relationalOperator: in,
              logicalNot: false
            },
            {
              key: "isDeleted",
              booleanValue: false,
              relationalOperator: eq,
              logicalNot: false
            },
            {
              key: "workflow.status",
              stringValue: "new",
              relationalOperator: eq,
              logicalNot: false
            }
          ]
        },
        {
          all:[
            {
              key: "price.min",
              floatValue: 19.99,
              relationalOperator: gte,
              logicalNot: false
            },
            {
              key: "type",
              stringValue: "simple",
              relationalOperator: eq,
              logicalNot: false
            }
          ]
        }
      ]
    }

  const { filterQuery } = generateFilterQuery(context, "Product", conditions, shopId);

  return Products.find(filterQuery);
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
This Reaction plugin is [GNU GPLv3 Licensed](./LICENSE.md)
