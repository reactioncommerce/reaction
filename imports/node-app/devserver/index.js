import express from "express";
import Logger from "@reactioncommerce/logger";
import ReactionNodeApp from "../core/ReactionNodeApp";
import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import filesStartup from "./filesStartup";
import "./extendSchemas";

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

app.apolloServer.installSubscriptionHandlers(app.httpServer);

app.start({ mongoUrl: MONGO_URL, port: PORT })
  .then(() => {
    Logger.info(`GraphQL listening at ${ROOT_URL}${app.apolloServer.graphqlPath}`);
    Logger.info(`GraphQL subscriptions ready at ${ROOT_URL.replace("http", "ws")}${app.apolloServer.subscriptionsPath}`);
    return null;
  })
  .catch((error) => {
    Logger.error(error);
  });

// Shut down gracefully
process.on("SIGINT", async () => {
  await app.stop();
});
