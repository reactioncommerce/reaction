import pkg from "../package.json";
import i18n from "./i18n/index.js";
import mutateNewOrderItemBeforeCreate from "./mutateNewOrderItemBeforeCreate.js";
import mutateNewVariantBeforeCreate from "./mutateNewVariantBeforeCreate.js";
import publishProductToCatalog from "./publishProductToCatalog.js";
import { registerPluginHandlerForTaxes } from "./registration.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
import preStartup from "./preStartup.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import setTaxesOnCart from "./util/setTaxesOnCart.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Taxes",
    name: "taxes",
    version: pkg.version,
    i18n,
    cart: {
      transforms: [
        {
          name: "setTaxesOnCart",
          fn: setTaxesOnCart,
          priority: 30
        }
      ]
    },
    catalog: {
      publishedProductVariantFields: ["isTaxable", "taxCode", "taxDescription"]
    },
    functionsByType: {
      mutateNewOrderItemBeforeCreate: [mutateNewOrderItemBeforeCreate],
      mutateNewVariantBeforeCreate: [mutateNewVariantBeforeCreate],
      preStartup: [preStartup],
      publishProductToCatalog: [publishProductToCatalog],
      registerPluginHandler: [registerPluginHandlerForTaxes]
    },
    graphQL: {
      schemas,
      resolvers
    },
    mutations,
    policies,
    queries,
    shopSettingsConfig: {
      defaultTaxCode: {
        permissionsThatCanEdit: ["reaction:legacy:taxes/update:settings"],
        simpleSchema: {
          type: String,
          min: 1
        }
      },
      fallbackTaxServiceName: {
        permissionsThatCanEdit: ["reaction:legacy:taxes/update:settings"],
        simpleSchema: {
          type: String,
          min: 1
        }
      },
      primaryTaxServiceName: {
        permissionsThatCanEdit: ["reaction:legacy:taxes/update:settings"],
        simpleSchema: {
          type: String,
          min: 1
        }
      }
    }
  });
}
