import express from "express";
import Logger from "@reactioncommerce/logger";
import packageJson from "/package.json";
import ReactionNodeApp from "./core/ReactionNodeApp";
import registerPlugins from "./registerPlugins";

const { MONGO_URL, NODE_ENV, PORT = 3030, ROOT_URL } = process.env;
if (!MONGO_URL) throw new Error("You must set MONGO_URL");
if (!ROOT_URL) throw new Error("You must set ROOT_URL");

const app = new ReactionNodeApp({
  debug: NODE_ENV !== "production",
  version: packageJson.version
});

registerPlugins(app)
  .then(() => app.start({ mongoUrl: MONGO_URL, port: PORT }))
  .then(() => {
    Logger.info(`GraphQL listening at ${ROOT_URL}${app.apolloServer.graphqlPath}`);

    // Serve files in the /public folder statically
    app.expressApp.use(express.static("public"));

    app.apolloServer.installSubscriptionHandlers(app.httpServer);

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
