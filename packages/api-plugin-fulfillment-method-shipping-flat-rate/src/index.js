import pkg from "../package.json" assert { type: "json" };
import fulfillmentMethodsWithQuotesShippingFlatRate from "./fulfillmentMethodsWithQuotesShippingFlatRate.js";
import validateOrderMethodsFlatRate from "./util/validateOrderMethodsFlatRate.js";
import i18n from "./i18n/index.js";
import resolvers from "./resolvers/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json" assert { type: "json" };
import queries from "./queries/index.js";
import schemas from "./schemas/index.js";
import fulfillmentMethodShippingFlatRatePreStartup from "./preStartup.js";
import { MethodFlatRateData } from "./simpleSchemas.js";


const { name, version } = pkg;
export const logCtx = {
  name,
  version,
  file: "src/index.js"
};

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment Method Shipping Flat Rate",
    name: "fulfillment-method-shipping-flat-rate",
    version: pkg.version,
    i18n,
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    policies,
    queries,
    simpleSchemas: {
      MethodFlatRateData
    },
    functionsByType: {
      preStartup: [fulfillmentMethodShippingFlatRatePreStartup],
      validateOrderMethods: [{ key: "flatRate", handler: validateOrderMethodsFlatRate, name: "validateOrderMethodsFlatRate" }],
      fulfillmentMethodsWithQuotes: [
        { key: "shipping", handler: fulfillmentMethodsWithQuotesShippingFlatRate, name: "fulfillmentMethodsWithQuotesShippingFlatRate" }
      ]
    },
    shopSettingsConfig: {
      isShippingRatesFulfillmentEnabled: {
        defaultValue: true,
        permissionsThatCanEdit: ["reaction:legacy:shippingMethods/update:settings"],
        simpleSchema: {
          type: Boolean
        }
      }
    }
  });
}
