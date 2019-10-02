import i18n from "./i18n/index.js";
import queries from "./queries/index.js";
import { registerPluginHandler } from "./registration.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Address",
    name: "reaction-address",
    i18n,
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
