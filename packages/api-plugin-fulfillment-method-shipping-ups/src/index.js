import { createRequire } from "module";
import { MethodDynamicRateData } from "./simpleSchemas.js";
import preStartup from "./preStartup.js";
import startup from "./startup.js";
import schemas from "./schemas/index.js";
import getFulfillmentMethodsWithQuotesShippingDynamicRate from "./getFulfillmentMethodsWithQuotesShippingDynamicRate.js";
import validateOrderMethodsDynamicRate from "./util/validateOrderMethodsDynamicRate.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment Method Shipping Dynamic Rate",
    name: "fulfillment-method-shipping-dynamic-rate",
    version: pkg.version,
    graphQL: {
      schemas
    },
    simpleSchemas: {
      MethodDynamicRateData
    },
    functionsByType: {
      preStartup: [preStartup],
      startup: [startup],
      validateOrderMethods: [{ key: "dynamicRate", handler: validateOrderMethodsDynamicRate }],
      getFulfillmentMethodsWithQuotes: [{ key: "shipping", handler: getFulfillmentMethodsWithQuotesShippingDynamicRate }]
    }
  });
}