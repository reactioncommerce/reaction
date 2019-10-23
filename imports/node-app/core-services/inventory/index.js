import i18n from "./i18n/index.js";
import queries from "./queries/index.js";
import schemas from "./schemas/index.js";
import preStartup from "./utils/preStartup.js";
import publishProductToCatalog from "./utils/publishProductToCatalog.js";
import startup from "./utils/startup.js";
import xformCartItems from "./utils/xformCartItems.js";
import xformCatalogBooleanFilters from "./utils/xformCatalogBooleanFilters.js";
import xformCatalogProductVariants from "./utils/xformCatalogProductVariants.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Inventory",
    name: "reaction-inventory",
    i18n,
    functionsByType: {
      preStartup: [preStartup],
      publishProductToCatalog: [publishProductToCatalog],
      startup: [startup],
      xformCartItems: [xformCartItems],
      xformCatalogBooleanFilters: [xformCatalogBooleanFilters],
      xformCatalogProductVariants: [xformCatalogProductVariants]
    },
    queries,
    graphQL: {
      schemas
    },
    shopSettingsConfig: {
      canSellVariantWithoutInventory: {
        defaultValue: true,
        rolesThatCanEdit: ["admin"],
        simpleSchema: {
          type: Boolean
        }
      }
    }
  });
}
