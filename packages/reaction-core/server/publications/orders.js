/**
 * orders
 */

Meteor.publish('Orders', function(userId) {
  check(userId, Match.Optional(String));

  if (Roles.userIsInRole(this.userId, ['admin', 'owner'], ReactionCore.getShopId(this))) {
    return ReactionCore.Collections.Orders.find({
      shopId: ReactionCore.getShopId(this)
    });
  } else {
    return [];
  }

});


/**
 * account orders
 */

Meteor.publish('AccountOrders', function(userId, shopId) {
  check(userId, Match.OptionalOrNull(String));
  check(shopId, Match.OptionalOrNull(String));
  shopId = shopId || ReactionCore.getShopId(this);

  if (userId && userId !== this.userId) {
    return [];
  }

  return ReactionCore.Collections.Orders.find({
    'shopId': shopId,
    'userId': this.userId
  });

});


/**
 * completed cart order
 */

Meteor.publish('CompletedCartOrder', function(userId, cartId) {
  check(userId, String);
  check(cartId, String);

  return ReactionCore.Collections.Orders.find({
    'cartId': cartId,
    'userId': userId
  });

});
