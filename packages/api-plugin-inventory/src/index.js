import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import queries from "./queries/index.js";
import schemas from "./schemas/index.js";
import policies from "./policies.json" assert { type: "json" };
import preStartup from "./utils/preStartup.js";
import publishProductToCatalog from "./utils/publishProductToCatalog.js";
import startup from "./utils/startup.js";
import xformCartItems from "./utils/xformCartItems.js";
import xformCatalogBooleanFilters from "./utils/xformCatalogBooleanFilters.js";
import xformCatalogProductVariants from "./utils/xformCatalogProductVariants.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Inventory",
    name: "inventory",
    version: pkg.version,
    i18n,
    functionsByType: {
      preStartup: [preStartup],
      publishProductToCatalog: [publishProductToCatalog],
      startup: [startup],
      xformCartItems: [xformCartItems],
      xformCatalogBooleanFilters: [xformCatalogBooleanFilters],
      xformCatalogProductVariants: [xformCatalogProductVariants]
    },
    policies,
    queries,
    graphQL: {
      schemas
    },
    shopSettingsConfig: {
      canSellVariantWithoutInventory: {
        defaultValue: true,
        permissionsThatCanEdit: ["reaction:legacy:inventory/update:settings"],
        simpleSchema: {
          type: Boolean
        }
      }
    }
  });
}
