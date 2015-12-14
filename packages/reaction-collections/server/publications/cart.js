/**
 * cart
 */

Meteor.publish("Cart", function (sessionId, userId) {
  check(sessionId, Match.OneOf(String, null));
  check(userId, Match.OptionalOrNull(String));
  // sessionId is required, not for selecting
  // the cart, (userId), but as a key in merging
  // anonymous user carts into authenticated existing
  // user carts.
  // we won't create carts unless we've got sessionId
  if (!this.userId || sessionId === null) {
    this.ready();
  }
  // shopId is also required.
  if (!ReactionCore.getShopId()) {
    this.ready();
  }
  // select user cart
  cart = ReactionCore.Collections.Cart.findOne({
    userId: this.userId
  });

  // we may create a cart if we didn't find one.
  if (cart) {
    cartId = cart._id;
  } else if (this.userId) {
    cartId = Meteor.call("cart/createCart", this.userId);
  } else {
    this.ready();
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
