import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Inventory } from "/lib/collections";
import { Reaction } from "/server/api";

Meteor.publish("Inventory", function () {
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (Roles.userIsInRole(
    this.userId, ["admin", "owner", "createProduct"],
    shopId
  )) {
    return Inventory.find({
      shopId
    });
  }
  return this.ready();
});
