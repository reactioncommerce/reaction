import Reaction from "/imports/plugins/core/core/server/Reaction";
import queries from "./server/no-meteor/queries";
import startup from "./server/no-meteor/startup";

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
    startup: [startup]
  },
  graphQL: {},
  queries,
  settings: {
    name: "Pricing"
  }
});
