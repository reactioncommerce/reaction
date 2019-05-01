import Reaction from "/imports/plugins/core/core/server/Reaction";
import queries from "./server/no-meteor/queries";
import schemas from "./server/no-meteor/schemas";
import publishProductToCatalog from "./server/no-meteor/utils/publishProductToCatalog";
import xformCatalogBooleanFilters from "./server/no-meteor/utils/xformCatalogBooleanFilters";

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
  }
});
