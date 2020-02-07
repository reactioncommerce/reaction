import Logger from "@reactioncommerce/logger";
import packageJson from "../package.json";
import ReactionAPI from "./core/ReactionAPI.js";
import config from "./core/config.js";

const app = new ReactionAPI({
  serveStaticPaths: ["public"],
  version: packageJson.version
});

/**
 * @summary Registers Reaction API plugins and then starts the app
 * @return {Promise<undefined>} undefined
 */
async function runApp() {
  await app.start();

  Logger.info(`GraphQL listening at ${app.graphQLServerUrl} (port ${app.serverPort || "unknown"})`);

  if (config.REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED) {
    Logger.info(`GraphQL subscriptions ready at ${app.graphQLServerSubscriptionUrl} (port ${app.serverPort || "unknown"})`);
  }
}

runApp().catch((error) => {
  Logger.error(error);
  process.exit(1); // eslint-disable-line no-process-exit
});
