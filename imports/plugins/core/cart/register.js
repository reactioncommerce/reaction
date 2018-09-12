import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Cart",
  name: "reaction-cart",
  autoEnable: true,
  startupFunctions: [startup]
});
