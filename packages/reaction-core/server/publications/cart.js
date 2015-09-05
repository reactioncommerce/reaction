/**
 * cart
 */

Meteor.publish('Cart', function() {
  /*check(userId, Match.OptionalOrNull(String));*/
  /*if (!this.userId) {
    return;
  }*/

  cart = ReactionCore.Collections.Cart.find({
    userId: this.userId
  });

  if (cart.count() > 0 ) {
    return cart;
  }
  else if (this.userId)
  {
    Meteor.call("createCart", this.userId);
    return cart;
  }

});


/**
 * shipping
 */

Meteor.publish("Shipping", function() {
  return ReactionCore.Collections.Shipping.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * taxes
 */

Meteor.publish("Taxes", function() {
  return ReactionCore.Collections.Taxes.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * discounts
 */

Meteor.publish("Discounts", function() {
  return ReactionCore.Collections.Discounts.find({
    shopId: ReactionCore.getShopId()
  });
});
