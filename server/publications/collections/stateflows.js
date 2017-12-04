import { Meteor } from "meteor/meteor";
import { Stateflows } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * Stateflows (blueprints for Workflows)
 */
Meteor.publish("Stateflows", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Stateflows.find({
    shopId: Reaction.getPrimaryShopId()
  });
});
