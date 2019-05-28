import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";
import { registerPluginHandler } from "./util/settingsConfig";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "App Settings",
    name: "reaction-settings",
    functionsByType: {
      registerPluginHandler: [registerPluginHandler],
      startup: [startup]
    },
    mutations,
    queries,
    graphQL: {
      resolvers,
      schemas
    }
  });
}
