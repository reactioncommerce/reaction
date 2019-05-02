import Reaction from "/imports/plugins/core/core/server/Reaction";
import queries from "./server/no-meteor/queries";
import schemas from "./server/no-meteor/schemas";
import publishProductToCatalog from "./server/no-meteor/utils/publishProductToCatalog";
import xformCartItems from "./server/no-meteor/utils/xformCartItems";
import xformCatalogBooleanFilters from "./server/no-meteor/utils/xformCatalogBooleanFilters";
import xformCatalogProductVariants from "./server/no-meteor/utils/xformCatalogProductVariants";

Reaction.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  autoEnable: true,
  functionsByType: {
    publishProductToCatalog: [publishProductToCatalog],
    xformCartItems: [xformCartItems],
    xformCatalogBooleanFilters: [xformCatalogBooleanFilters],
    xformCatalogProductVariants: [xformCatalogProductVariants]
  },
  queries,
  graphQL: {
    schemas
  }
});
