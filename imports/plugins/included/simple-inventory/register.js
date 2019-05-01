import Reaction from "/imports/plugins/core/core/server/Reaction";
import inventoryForProductConfigurations from "./server/no-meteor/utils/inventoryForProductConfigurations";
import startup from "./server/no-meteor/startup";

/**
 * Simple Inventory plugin
 * Isolates the get/set of inventory data to this plugin.
 */

Reaction.registerPackage({
  label: "Simple Inventory",
  name: "reaction-simple-inventory",
  functionsByType: {
    inventoryForProductConfigurations: [inventoryForProductConfigurations],
    startup: [startup]
  },
  graphQL: {}
});
