import express from "express";
import Logger from "@reactioncommerce/logger";
import ReactionNodeApp from "./core/ReactionNodeApp";
import filesService from "./services/files";
import fulfillmentService from "./services/fulfillment";

const { MONGO_URL, ROOT_URL } = process.env;
if (!MONGO_URL) throw new Error("You must set MONGO_URL");
if (!ROOT_URL) throw new Error("You must set ROOT_URL");

const PORT = 3030;

const app = new ReactionNodeApp({
  additionalServices: [
    filesService
  ],
  graphiql: true,
  mongoUrl: MONGO_URL,
  port: PORT,
  rootUrl: ROOT_URL,
  services: {
    fulfillment: fulfillmentService
  }
});

// Serve files in the /public folder statically
app.expressApp.use(express.static("public"));

app.start()
  .then(() => {
    Logger.info(`GraphQL listening at http://localhost:${PORT}/graphql-alpha`);
    Logger.info(`GraphiQL UI: http://localhost:${PORT}/graphiql`);
    return null;
  })
  .catch((error) => {
    Logger.error(error);
  });
