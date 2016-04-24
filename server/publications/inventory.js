import { Inventory } from "/lib/collections";

Meteor.publish("Inventory", function () {
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "createProduct"],
    shopId)) {
    return Inventory.find({
      shopId: shopId
    });
  }
  return this.ready();
});
