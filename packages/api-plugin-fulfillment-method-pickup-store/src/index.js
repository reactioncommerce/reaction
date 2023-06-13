import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import fulfillmentMethodPickupStorePreStartup from "./preStartup.js";
import fulfillmentMethodPickupStoreStartup from "./startup.js";
import { MethodStoreData } from "./simpleSchemas.js";
import schemas from "./schemas/index.js";
import fulfillmentMethodsWithQuotesPickupStore from "./fulfillmentMethodsWithQuotesPickupStore.js";
import validateOrderMethodsStore from "./util/validateOrderMethodsStore.js";


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment Method Pickup Store",
    name: "fulfillment-method-pickup-store",
    version: pkg.version,
    i18n,
    graphQL: {
      schemas
    },
    simpleSchemas: {
      MethodStoreData
    },
    functionsByType: {
      preStartup: [fulfillmentMethodPickupStorePreStartup],
      startup: [fulfillmentMethodPickupStoreStartup],
      validateOrderMethods: [{ key: "store", handler: validateOrderMethodsStore, name: "validateOrderMethodsStore" }],
      fulfillmentMethodsWithQuotes: [{ key: "pickup", handler: fulfillmentMethodsWithQuotesPickupStore, name: "fulfillmentMethodsWithQuotesPickupStore" }]
    }
  });
}
