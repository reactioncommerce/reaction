import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import { registerPluginHandler } from "./util/settingsConfig.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "App Settings",
    name: "reaction-settings",
    collections: {
      AppSettings: {
        name: "AppSettings",
        indexes: [
          [{ shopId: 1 }, { unique: true }]
        ]
      }
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandler]
    },
    mutations,
    queries,
    graphQL: {
      resolvers,
      schemas
    }
  });
}
