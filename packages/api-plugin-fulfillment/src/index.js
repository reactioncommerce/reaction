import { createRequire } from "module";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import preStartup from "./preStartup.js";
import { MethodEmptyData } from "./simpleSchemas.js";
import { fulfillment, registerPluginHandlerForFulfillmentTypes } from "./registration.js";

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
          [{ name: 1 }],
          [{ shopId: 1 }]
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
      fulfillment
    },
    simpleSchemas: {
      MethodEmptyData
    },
    shopSettingsConfig: {
      baseFulfillmentTypesForShop: {
        permissionsThatCanEdit: ["reaction:legacy:fulfillmentTypes/update:settings"],
        simpleSchema: {
          type: {
            "baseFulfillmentTypesForShop": {
              type: Array,
              optional: true
            },
            "baseFulfillmentTypesForShop.$": {
              type: String
            }
          }
        }
      }
    }
  });
}
