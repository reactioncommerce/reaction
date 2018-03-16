import { typeDefs as account } from "./account";
import { typeDefs as address } from "./address";
import { typeDefs as currency } from "./currency";
import { typeDefs as datetime } from "./datetime";
import { typeDefs as email } from "./email";
import { typeDefs as group } from "./group";
import { typeDefs as hello } from "./hello";
import { typeDefs as jsonObject } from "./json-object";
import { typeDefs as metafield } from "./metafield";
import { typeDefs as node } from "./node";
import { typeDefs as role } from "./role";
import { typeDefs as shop } from "./shop";

// Define base GraphQL schema maps that can be extended by the schema modules
// without throwing errors. Extend with `extend type Query ...`.
// See https://www.apollographql.com/docs/graphql-tools/generate-schema.html#extend-types
const base = [
  `
  type Mutation {
    echo(str: String): String
  }

  type Query {
    ping: String!
  }
  `
];

export default base.concat([
  account,
  address,
  currency,
  datetime,
  email,
  group,
  hello,
  jsonObject,
  metafield,
  node,
  role,
  shop
]);
