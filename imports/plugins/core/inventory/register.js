import Reaction from "/imports/plugins/core/core/server/Reaction";
import config from "./server/config";
import queries from "./server/no-meteor/queries";
import schemas from "./server/no-meteor/schemas";
import publishProductToCatalog from "./server/no-meteor/utils/publishProductToCatalog";
import xformCatalogBooleanFilters from "./server/no-meteor/utils/xformCatalogBooleanFilters";

const publishedProductVariantFields = [];

// These fields require manual publication only if they are
// not auto-published on every variant update.
if (!config.AUTO_PUBLISH_INVENTORY_FIELDS) {
  publishedProductVariantFields.push(
    "inventoryManagement",
    "inventoryPolicy",
    "lowInventoryWarningThreshold"
  );
}

Reaction.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  autoEnable: true,
  functionsByType: {
    publishProductToCatalog: [publishProductToCatalog],
    xformCatalogBooleanFilters: [xformCatalogBooleanFilters]
  },
  queries,
  graphQL: {
    schemas
  },
  catalog: {
    publishedProductVariantFields
  }
});
