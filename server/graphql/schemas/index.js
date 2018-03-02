import { typeDefs as hello } from "./hello";
import { typeDefs as metafield } from "./metafield";
import { typeDefs as scalars } from "./scalars";
import { typeDefs as users } from "./users";

// Define base GraphQL schema maps that can be extended by the schema modules
// without throwing errors. Extend with `extend type Query ...`.
// See https://www.apollographql.com/docs/graphql-tools/generate-schema.html#extend-types
const base = [
  `
  type Query {
    ping: String!
  }

  type Mutation {
    echo(str: String): String
  }
  `
];

export const typeDefs = base.concat([hello, metafield, scalars, users]);
