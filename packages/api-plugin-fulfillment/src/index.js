import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import preStartup from "./preStartup.js";
import { MethodEmptyData } from "./simpleSchemas.js";
import { fulfillment, registerPluginHandlerForFulfillmentTypes } from "./registration.js";


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
