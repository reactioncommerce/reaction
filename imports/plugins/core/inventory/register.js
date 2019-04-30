import Reaction from "/imports/plugins/core/core/server/Reaction";
import config from "./server/config";
import queries from "./server/no-meteor/queries";
import startup from "./server/no-meteor/startup";
import schemas from "./server/no-meteor/schemas";
import publishProductToCatalog from "./server/no-meteor/utils/publishProductToCatalog";
import xformCatalogBooleanFilters from "./server/no-meteor/utils/xformCatalogBooleanFilters";

const publishedProductFields = [];

// These require manual publication always
const publishedProductVariantFields = [
  "inventoryManagement",
  "inventoryPolicy"
];

// Additional fields require manual publication only if they are
// not auto-published on every variant update.
if (!config.AUTO_PUBLISH_INVENTORY_FIELDS) {
  publishedProductFields.push(
    "inventoryAvailableToSell",
    "inventoryInStock",
    "isBackorder",
    "isLowQuantity",
    "isSoldOut"
  );

  publishedProductVariantFields.push(
    "inventoryAvailableToSell",
    "inventoryInStock",
    "isBackorder",
    "isLowQuantity",
    "isSoldOut",
    "lowInventoryWarningThreshold"
  );
}

Reaction.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  autoEnable: true,
  functionsByType: {
    publishProductToCatalog: [publishProductToCatalog],
    startup: [startup],
    xformCatalogBooleanFilters: [xformCatalogBooleanFilters]
  },
  queries,
  graphQL: {
    schemas
  },
  catalog: {
    publishedProductFields,
    publishedProductVariantFields
  }
});
