import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Discounts",
  name: "reaction-discounts",
  icon: "fa fa-gift",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  }
});
