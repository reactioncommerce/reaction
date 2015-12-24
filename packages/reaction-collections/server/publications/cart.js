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
  if (this.userId === null || sessionId === null) {
    return this.ready();
  }

  // shopId is also required.
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }

  // select user cart
  const cart = ReactionCore.Collections.Cart.find({
    userId: this.userId,
    shopId: shopId
  });

  if (cart.count()) {
    // we could keep `sessionId` of normal user up to date from here, but with
    // current session logic we don't need this. That's why we just return
    // cursor as is with whatever `sessioId`.
    return cart;
  }
  // we may create a cart if we didn't find one.
  const cartId = Meteor.call("cart/createCart", this.userId);

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
