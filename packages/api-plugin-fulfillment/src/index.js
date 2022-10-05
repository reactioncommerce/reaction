import { createRequire } from "module";
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import preStartup from "./preStartup.js";
import { MethodEmptyData } from "./simpleSchemas.js";
import { allRegisteredFulfillmentTypes, registerPluginHandlerForFulfillmentTypes } from "./registration.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment",
    name: "fulfillment",
    version: pkg.version,
    i18n,
    collections: {
      FulfillmentRestrictions: {
        name: "FulfillmentRestrictions",
        indexes: [
          [{ methodIds: 1 }]
        ]
      },
      Fulfillment: {
        name: "Fulfillment",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ name: 1 }, { name: "c2_name" }],
          [{ shopId: 1 }, { name: "c2_shopId" }]
        ]
      }
    },
    graphQL: {
      schemas,
      resolvers
    },
    queries,
    mutations,
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForFulfillmentTypes],
      preStartup: [preStartup],
      startup: [startup]
    },
    contextAdditions: {
      allRegisteredFulfillmentTypes
    },
    simpleSchemas: {
      MethodEmptyData
    }
  });
}
