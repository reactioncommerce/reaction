import policies from "./policies.json";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "System Information",
    name: "reaction-systeminfo",
    version: app.context.appVersion,
    graphQL: {
      resolvers,
      schemas
    },
    policies,
    queries
  });
}
