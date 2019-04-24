import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";
import schemas from "./server/no-meteor/schemas";
import xformCatalogBooleanFilters from "./server/no-meteor/utils/xformCatalogBooleanFilters";

Reaction.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  autoEnable: true,
  functionsByType: {
    startup: [startup],
    xformCatalogBooleanFilters: [xformCatalogBooleanFilters]
  },
  graphQL: {
    schemas
  },
  catalog: {
    publishedProductFields: [
      "inventoryAvailableToSell",
      "inventoryInStock",
      "isBackorder",
      "isLowQuantity",
      "isSoldOut"
    ],
    publishedProductVariantFields: [
      "inventoryAvailableToSell",
      "inventoryInStock",
      "inventoryManagement",
      "inventoryPolicy",
      "isBackorder",
      "isLowQuantity",
      "isSoldOut",
      "lowInventoryWarningThreshold"
    ]
  }
});
