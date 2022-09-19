import { createRequire } from "module";
import { MethodUPSData } from "./simpleSchemas.js";
import preStartup from "./preStartup.js";
import startup from "./startup.js";
import schemas from "./schemas/index.js";
import getFulfillmentMethodsWithQuotesShippingUPS from "./getFulfillmentMethodsWithQuotesShippingUPS.js";
import validateOrderMethodsups from "./util/validateOrderMethodsups.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment Method Shipping UPS",
    name: "fulfillment-method-shipping-ups",
    version: pkg.version,
    graphQL: {
      schemas
    },
    simpleSchemas: {
      MethodUPSData
    },
    functionsByType: {
      preStartup: [preStartup],
      startup: [startup],
      validateOrderMethods: [validateOrderMethodsups],
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotesShippingUPS],
      getFulfillmentMethodsWithQuotesshipping: [getFulfillmentMethodsWithQuotesShippingUPS]
    }
  });
}
