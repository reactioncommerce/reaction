import { MongoClient } from "mongodb";
import createApolloServer from "../../imports/plugins/core/graphql/server/createApolloServer";
import defineCollections from "../../imports/plugins/core/graphql/server/defineCollections";
import getUserFromToken from "../../imports/plugins/core/graphql/server/getUserFromToken";
import methods from "./methods";
import queries from "../../imports/plugins/core/graphql/server/queries";

const { MONGO_URL } = process.env;
if (!MONGO_URL) throw new Error("You must set MONGO_URL");

const lastSlash = MONGO_URL.lastIndexOf("/");
const dbUrl = MONGO_URL.slice(0, lastSlash);
const dbName = MONGO_URL.slice(lastSlash + 1);
const PORT = 3030;

let mongoClient;
let db;

const collections = {};

MongoClient.connect(dbUrl, (error, client) => {
  if (error) throw error;
  console.info("Connected to MongoDB");
  mongoClient = client;
  db = client.db(dbName);
  defineCollections(db, collections);
});

/**
 * This is a server for development of the GraphQL API without needing
 * to run Meteor. After finishing development, you should still test
 * the API changes through the Meteor app in case there are any differences.
 */
const app = createApolloServer({
  context: {
    collections,
    hasPermission: () => Promise.resolve(true),
    methods,
    queries
  },
  debug: true,
  getUserFromToken,
  graphiql: true
});

app.listen(PORT, () => {
  console.info(`GraphQL listening at http://localhost:${PORT}/graphql-alpha`);
  console.info(`GraphiQL UI: http://localhost:${PORT}/graphiql`);
});
