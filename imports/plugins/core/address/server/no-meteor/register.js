import queries from "./queries";
import { registerPluginHandler } from "./registration";
import resolvers from "./resolvers";
import schemas from "./schemas";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Address",
    name: "reaction-address",
    functionsByType: {
      registerPluginHandler: [registerPluginHandler]
    },
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    registry: [
      {
        label: "Address Validation",
        provides: ["shopSettings"],
        container: "dashboard",
        template: "ShopAddressValidationSettings"
      }
    ]
  });
}
