/**
 * cart
 */

Meteor.publish("Cart", function (clientSessionId, userId) {
  check(clientSessionId, Match.OptionalOrNull(String));
  check(userId, Match.OptionalOrNull(String));

  if (!ReactionCore.getShopId()) {
    return [];
  }
  // sessionId is required, not for selecting
  // the cart, (userId), but as a key in merging
  // anonymous user carts into authenticated existing
  // user carts.
  let sessionId = clientSessionId || ReactionCore.sessionId;
  // we won't create carts for unless
  // we've got an id an session
  if (!this.userId || sessionId === null) {
    return [];
  }
  // select user cart
  cart = ReactionCore.Collections.Cart.findOne({
    userId: this.userId
  });

  // we may create a cart if we didn't find one.
  if (cart) {
    cartId = cart._id;
  } else {
    cartId = Meteor.call("cart/createCart", this.userId);
  }
  // return cart cursor
  return ReactionCore.Collections.Cart.find(cartId);
});

/**
 * shipping
 */

Meteor.publish("Shipping", function () {
  return ReactionCore.Collections.Shipping.find({
    shopId: ReactionCore.getShopId()
  });
});

/**
 * taxes
 */

Meteor.publish("Taxes", function () {
  return ReactionCore.Collections.Taxes.find({
    shopId: ReactionCore.getShopId()
  });
});

/**
 * discounts
 */

Meteor.publish("Discounts", function () {
  return ReactionCore.Collections.Discounts.find({
    shopId: ReactionCore.getShopId()
  });
});
