import Reaction from "/imports/plugins/core/core/server/Reaction";
import queries from "./server/no-meteor/queries";
import schemas from "./server/no-meteor/schemas";
import startup from "./server/no-meteor/startup";
import getMinPriceSortByFieldPath from "./server/no-meteor/util/getMinPriceSortByFieldPath";
import publishProductToCatalog from "./server/no-meteor/util/publishProductToCatalog";

/**
 * Simple Pricing plugin
 * Isolates the get/set of pricing data to this plugin.
 */

Reaction.registerPackage({
  label: "Pricing",
  name: "reaction-pricing",
  icon: "fa fa-dollar-sign",
  autoEnable: true,
  functionsByType: {
    getMinPriceSortByFieldPath: [getMinPriceSortByFieldPath],
    publishProductToCatalog: [publishProductToCatalog],
    startup: [startup]
  },
  graphQL: {
    schemas
  },
  queries,
  settings: {
    name: "Pricing"
  }
});
