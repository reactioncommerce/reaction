import { createRequire } from "module";
import fulfillmentMethodPickupStorePreStartup from "./preStartup.js";
import fulfillmentMethodPickupStoreStartup from "./startup.js";
import { MethodStoreData } from "./simpleSchemas.js";
import schemas from "./schemas/index.js";
import getFulfillmentMethodsWithQuotesPickupStore from "./getFulfillmentMethodsWithQuotesPickupStore.js";
import validateOrderMethodsStore from "./util/validateOrderMethodsStore.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

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
    graphQL: {
      schemas
    },
    simpleSchemas: {
      MethodStoreData
    },
    functionsByType: {
      preStartup: [fulfillmentMethodPickupStorePreStartup],
      startup: [fulfillmentMethodPickupStoreStartup],
      validateOrderMethods: [{ key: "store", handler: validateOrderMethodsStore }],
      getFulfillmentMethodsWithQuotes: [{ key: "pickup", handler: getFulfillmentMethodsWithQuotesPickupStore }]
    }
  });
}
