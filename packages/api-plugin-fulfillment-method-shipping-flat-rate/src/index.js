import { createRequire } from "module";
import getFulfillmentMethodsWithQuotesShippingFlatRate from "./getFulfillmentMethodsWithQuotesShippingFlatRate.js";
import validateOrderMethodsflatRate from "./util/validateOrderMethodsflatrate.js";
import resolvers from "./resolvers/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
import queries from "./queries/index.js";
import schemas from "./schemas/index.js";
import fulfillmentMethodShippingFlatRatePreStartup from "./preStartup.js";
import { MethodFlatRateData } from "./simpleSchemas.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

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
      validateOrderMethods: [validateOrderMethodsflatRate],
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotesShippingFlatRate],
      getFulfillmentMethodsWithQuotesShipping: [getFulfillmentMethodsWithQuotesShippingFlatRate]
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
