import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Discounts",
  name: "reaction-discounts",
  icon: "fa fa-gift",
  autoEnable: true,
  collections: {
    Discounts: {
      name: "Discounts",
      indexes: [
        // Create indexes. We set specific names for backwards compatibility
        // with indexes created by the aldeed:schema-index Meteor package.
        [{ shopId: 1 }, { name: "c2_shopId" }]
      ]
    }
  },
  functionsByType: {
    startup: [startup]
  }
});
