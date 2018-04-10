import { typeDefs as account } from "./account";
import { typeDefs as address } from "./address";
import { typeDefs as currency } from "./currency";
import { typeDefs as datetime } from "./datetime";
import { typeDefs as email } from "./email";
import { typeDefs as group } from "./group";
import { typeDefs as jsonObject } from "./json-object";
import { typeDefs as metafield } from "./metafield";
import { typeDefs as node } from "./node";
import { typeDefs as role } from "./role";
import { typeDefs as shop } from "./shop";
import { typeDefs as tag } from "./tag";

// Define base GraphQL schema maps that can be extended by the schema modules
// without throwing errors. Extend with `extend type Query ...`.
// See https://www.apollographql.com/docs/graphql-tools/generate-schema.html#extend-types
const base = [
  `
  # Mutations have side effects, such as mutating data or triggering a task
  type Mutation {
    echo(str: String): String
  }

  # Queries return all requested data, without any side effects
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
  jsonObject,
  metafield,
  node,
  role,
  shop,
  tag
]);
