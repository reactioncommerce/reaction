Meteor.publish("Inventory", function () {
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "createProduct"], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Inventory.find({
      shopId: ReactionCore.getShopId()
    });
  }
});
