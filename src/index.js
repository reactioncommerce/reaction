import Logger from "@reactioncommerce/logger";
import packageJson from "../package.json";
import ReactionAPI from "./core/ReactionAPI.js";
import registerPlugins from "./registerPlugins.js";

const app = new ReactionAPI({
  serveStaticPaths: ["public"],
  version: packageJson.version
});

/**
 * @summary Registers Reaction API plugins and then starts the app
 * @return {Promise<undefined>} undefined
 */
async function runApp() {
  await registerPlugins(app);

  await app.start();

  Logger.info(`GraphQL listening at ${app.graphQLServerUrl} (port ${app.serverPort || "unknown"})`);
  Logger.info(`GraphQL subscriptions ready at ${app.graphQLServerSubscriptionUrl} (port ${app.serverPort || "unknown"})`);
}

runApp().catch(Logger.error.bind(Logger));
