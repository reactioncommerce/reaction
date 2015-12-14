/**
 * orders
 */

Meteor.publish("Orders", function () {
  shopId = ReactionCore.getShopId();

  if (Roles.userIsInRole(this.userId, ["admin", "owner"], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      shopId: shopId
    });
  }
  return ReactionCore.Collections.Orders.find({
    shopId: shopId,
    userId: this.userId
  });
});

/*
 * account orders
 */

Meteor.publish("AccountOrders", function (userId, currentShopId) {
  check(userId, Match.OptionalOrNull(String));
  check(currentShopId, Match.OptionalOrNull(String));
  shopId = currentShopId || ReactionCore.getShopId(this);

  if (userId && userId !== this.userId) {
    this.ready();
  }

  return ReactionCore.Collections.Orders.find({
    shopId: shopId,
    userId: this.userId
  });
});

/*
 * completed cart order
 */
Meteor.publish("CompletedCartOrder", function (userId, cartId) {
  check(userId, Match.OneOf(String, null));
  check(cartId, String);

  if (userId !== this.userId) {
    this.ready();
  }

  return ReactionCore.Collections.Orders.find({
    cartId: cartId,
    userId: userId
  });
});
