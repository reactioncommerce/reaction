import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  }
});
