import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json" assert { type: "json" };
import queries from "./queries/index.js";
import { registerPluginHandlerForAddress } from "./registration.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Address Validation",
    name: "address-validation",
    version: pkg.version,
    i18n,
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForAddress]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    policies,
    queries,
    collections: {
      AddressValidationRules: {
        name: "AddressValidationRules",
        indexes: [
          [{ shopId: 1 }]
        ]
      }
    }
  });
}
