import pkg from "../package.json" assert { type: "json" };
import { MethodDynamicRateData } from "./simpleSchemas.js";
import i18n from "./i18n/index.js";
import preStartup from "./preStartup.js";
import startup from "./startup.js";
import schemas from "./schemas/index.js";
import fulfillmentMethodsWithQuotesShippingDynamicRate from "./fulfillmentMethodsWithQuotesShippingDynamicRate.js";
import validateOrderMethodsDynamicRate from "./util/validateOrderMethodsDynamicRate.js";


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
    i18n,
    graphQL: {
      schemas
    },
    simpleSchemas: {
      MethodDynamicRateData
    },
    functionsByType: {
      preStartup: [preStartup],
      startup: [startup],
      validateOrderMethods: [{ key: "dynamicRate", handler: validateOrderMethodsDynamicRate, name: "validateOrderMethodsDynamicRate" }],
      fulfillmentMethodsWithQuotes: [
        { key: "shipping", handler: fulfillmentMethodsWithQuotesShippingDynamicRate, name: "fulfillmentMethodsWithQuotesShippingDynamicRate" }
      ]
    }
  });
}
