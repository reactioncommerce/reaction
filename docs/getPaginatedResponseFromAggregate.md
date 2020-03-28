# getPaginatedResponseFromAggregate

Returns a paginated response from a MongoDB aggregation pipeline.

Usage example:

```js
import getPaginatedResponseFromAggregate from "@reactioncommerce/api-utils/getPaginatedResponseFromAggregate.js";

// the MongoDB collection you want to run your aggregation on
const collection = getYourMongoDBCollectionSomehow();

const pipeline = [
  {
    // for example, here's a $lookup operator
    $lookup: {
      // some options
    }
  },
  // but you can add,
  // any,
  // other,
  // operators
];

const args = {
  // connection arguments from your GraphQL query or mutation
  // supported:
  // offset: Int,
  // last: Int,
  // sortBy: String (the name of the MongoDB field you want to sort results by)
  // sortOrder: Int (-1 for descending or 1 for ascending)
};

const options = {
  // some options to control which optional fields get returned with the results
  // supported:
  // includeHasNextPage: Boolean,
  // includeHasPreviousPage: Boolean,
  // includeTotalCount: Boolean
};

const results = await getPaginatedResponseFromAggregate(collection, pipeline, args, options);
```
