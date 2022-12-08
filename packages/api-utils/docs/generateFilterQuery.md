
# generateFilterQuery

A function that generates a MongoDB filter query from an input GraphQL conditions object. It expects the input GraphQL conditions object to be in the format of the `FilterConditionsInput` input type (detailed below) defined in the GraphQL  Schemas along with other parameters like `context`, `collectionName` and `shopId`.

As seen in the format below, 
* The input object is a nested object where you could use  either `all` or `any` keys.
* Both the top level `all` & `any` keys are an array of objects with one more level of `all` or `any` keys.
* The inner `all` or `any` keys is an array of objects with the structure defined by `SingleConditionInput`.
* The `SingleConditionInput` object has the fields which define a single condition to filter on.
<br>
* The `all` key is equivalent of the `$and` operator in MongoDB and the `any` key is equivalent of the `$or` operator in MongoDB.
* In the `SingleConditionInput` object, mandatory fields are the `key`, `relationalOperator` and exactly any ONE of the value fields. The `key` is the field name to filter on. The `relationalOperator` is the relational operator to use to filter on the field (predefined as enum values). The `stringValue`, `intValue`, `floatValue`, `boolValue`, `dateValue`, `stringArrayValue`, `intArrayValue`, `floatArrayValue` are the values to filter on (use exactly one of this) depending on the key.
* Finally there are two more optional fields `caseSensitive` and `logicalNOT`. The `caseSensitive` is a boolean flag to set if the regex is case sensitive. The `logicalNOT` is a boolean flag to set if the condition is to be negated.

FilterConditionsInput format below (from GraphQL Schemas). __Example__ follows the format below:


```graphql

"Filter search with nested conditions of input (use either 'any' or 'all' not both)"
input FilterConditionsInput {
  "Array holding Nested conditions (use either 'any' or 'all' not both)"
  all: [ConditionsArray]

  "Array holding Nested conditions (use either 'any' or 'all' not both)"
  any: [ConditionsArray]
}


"Filter search with One level of conditions (use either 'any' or 'all' not both)"
input ConditionsArray {
  "Array of single-conditions"
  all: [SingleConditionInput]

  "Array of single-conditions"
  any: [SingleConditionInput]
}


"Single Condition for filterSearch, use exactly one of the optional input value type"
input SingleConditionInput {
  "Value to filter if it is Boolean input"
  boolValue: Boolean

  "Flag to set if the regex is case insensitive"
  caseSensitive: Boolean

  "Value to filter if it is Date input"
  dateValue: DateTime

  "Value to filter if it is Float Array input" 
  floatArrayValue: [Float]

  "Value to filter if it is Float input"
  floatValue: Float

  "Value to filter if it is Int Array input" 
  intArrayValue: [Int]

  "Value to filter if it is Int input"
  intValue: Int

  "Field name"
  key : String!

  "Logical NOT operator to negate the condition"
  logicalNOT: Boolean

  "Relational Operator to join the key and value"
  relationalOperator: RelationalOperatorTypes!

  "Value to filter if it is String Array input"
  stringArrayValue: [String]

  "Value to filter if it is String input"
  stringValue: String
}


"Relational Operator Types used in filtering inside a single condition"
enum RelationalOperatorTypes{
  "Begins With used with String types"
  beginsWith

  "Ends With used with String types"
  endsWith

  "Equal"
  eq

  "Greater Than"
  gt

  "Greater Than or Equal"
  gte

  "In"
  in

  "Less Than"
  lt

  "Less Than or Equal"
  lte

  "Not Equal"
  ne

  "Not In"
  nin

  "Regex"
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
              logicalNOT: false
            }
          ]
        }
      ]
    }

  const { filterQuery } = generateFilterQuery(context, "Product", conditions, shopId);

  return Products.find(filterQuery);
```

Please refer to readme in the respective plugins for more detailed examples (example: Products).

