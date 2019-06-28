import queries from "./queries";
import schemas from "./schemas";
import publishProductToCatalog from "./utils/publishProductToCatalog";
import startup from "./utils/startup";
import xformCartItems from "./utils/xformCartItems";
import xformCatalogBooleanFilters from "./utils/xformCatalogBooleanFilters";
import xformCatalogProductVariants from "./utils/xformCatalogProductVariants";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Inventory",
    name: "reaction-inventory",
    functionsByType: {
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
