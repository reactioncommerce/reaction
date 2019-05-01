import Reaction from "/imports/plugins/core/core/server/Reaction";
// import queries from "./server/no-meteor/queries";
import startup from "./server/no-meteor/startup";

/**
 * Simple Inventory plugin
 * Isolates the get/set of inventory data to this plugin.
 */

Reaction.registerPackage({
  label: "Simple Inventory",
  name: "reaction-simple-inventory",
  functionsByType: {
    startup: [startup]
  },
  graphQL: {}
  // queries
});
