import express from "express";
import bodyParser from "body-parser";
import { graphqlExpress } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";

// Within the current existing constraints
// (no async operations allowed during plugin setup pre-register),
// I don't think there's a way to use `await findFreePort()`.
// So I'm hard coding a high port and hoping for the best.
export const PORT = 65123;

const sdl = `
  type Query {
    unitTestRemoteGraphql: Float
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [sdl],
  resolvers: {
    Query: {
      unitTestRemoteGraphql() {
        return 42.42;
      }
    }
  }
});

export function getApp() {
  const app = express();
  // bodyParser is needed just for POST.
  app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
  return app;
}
