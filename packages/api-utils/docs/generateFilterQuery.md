
# generateFilterQuery

A function that generates a MongoDB filter query from an input GraphQL conditions object. It expects the input GraphQL conditions object to be in the format of the `FilterConditionsInput` input type (detailed below) defined in the GraphQL  Schemas along with other parameters like `context`, `collectionName` and `shopId`.

As seen in the format below, 
* The input object is a nested object where you could use  either `all` or `any` keys.
* Both the top level `all` & `any` keys are an array of objects with one more level of `all` or `any` keys.
* The inner `all` or `any` keys is an array of objects with the structure defined by `SingleConditionInput`.
* The `SingleConditionInput` object has the fields which define a single condition to filter on.
<br>
* The `all` key is equivalent of the `$and` operator in MongoDB and the `any` key is equivalent of the `$or` operator in MongoDB.
* In the `SingleConditionInput` object, mandatory fields are the `key`, `relationalOperator` and exactly any ONE of the value fields. The `key` is the field name to filter on. The `relationalOperator` is the relational operator to use to filter on the field (predefined as enum values). The `stringValue`, `integerValue`, `floatValue`, `booleanValue`, `dateValue`, `stringArrayValue`, `integerArrayValue`, `floatArrayValue` are the values to filter on (use exactly one of this) depending on the key.
* Finally there are two more optional fields `caseSensitive` and `logicalNot`. The `caseSensitive` is a boolean flag to set if the regex is case sensitive. The `logicalNot` is a boolean flag to set if the condition is to be negated.

FilterConditionsInput format below (from GraphQL Schemas). __Example__ follows the format below:


```graphql

input FilterConditionsInput {
  all: [ConditionsArray]

  any: [ConditionsArray]
}


input ConditionsArray {
  all: [SingleConditionInput]

  any: [SingleConditionInput]
}


input SingleConditionInput {
  booleanValue: Boolean
  caseSensitive: Boolean
  dateValue: DateTime
  floatArrayValue: [Float]
  floatValue: Float
  integerArrayValue: [Int]
  integerValue: Int
  key: String!
  logicalNot: Boolean
  relationalOperator: RelationalOperatorTypes!
  stringArrayValue: [String]
  stringValue: String
}


enum RelationalOperatorTypes{
  beginsWith
  endsWith
  eq
  gt
  gte
  in
  lt
  lte
  ne
  nin
  regex
}

```


## Example

Example of invoking the function with a simple conditions object. Here we are querying for products collection for entries with the handle as 'mens-waterproof-outdoor-rain-jacket'. Since it is single condition, using either `all` or `any` will not make difference. 

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

Please refer to readme in the respective plugins for more detailed examples (example: api-plugin-products).

