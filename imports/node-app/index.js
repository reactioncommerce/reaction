import express from "express";
import Logger from "@reactioncommerce/logger";
import ReactionNodeApp from "./core/ReactionNodeApp";
import mutations from "./core/mutations";
import queries from "./core/queries";
import resolvers from "./core/resolvers";
import schemas from "./core/schemas";
import filesStartup from "./filesStartup";

const { MONGO_URL, PORT = 3030, ROOT_URL } = process.env;
if (!MONGO_URL) throw new Error("You must set MONGO_URL");
if (!ROOT_URL) throw new Error("You must set ROOT_URL");

const app = new ReactionNodeApp({
  debug: true,
  context: {
    mutations,
    queries,
    rootUrl: ROOT_URL
  },
  functionsByType: {
    startup: [filesStartup]
  },
  graphQL: {
    graphiql: true,
    resolvers,
    schemas
  }
});

// Serve files in the /public folder statically
app.expressApp.use(express.static("public"));

app.start({ mongoUrl: MONGO_URL, port: PORT })
  .then(() => {
    Logger.info(`GraphQL listening at http://localhost:${PORT}/graphql-alpha`);
    Logger.info(`GraphiQL UI: http://localhost:${PORT}/graphiql`);
    return null;
  })
  .catch((error) => {
    Logger.error(error);
  });
