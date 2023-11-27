import pkg from "../package.json" assert { type: "json" };
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import { registerPluginHandlerForAppSettings } from "./util/settingsConfig.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Settings",
    name: "settings",
    version: pkg.version,
    collections: {
      AppSettings: {
        name: "AppSettings",
        indexes: [[{ shopId: 1 }, { unique: true }]]
      }
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForAppSettings]
    },
    mutations,
    queries,
    graphQL: {
      resolvers,
      schemas
    }
  });
}
