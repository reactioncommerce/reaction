/**
 * checkout publications
 *
 */


var Cart = ReactionCore.Collections.Cart;
var Discounts = ReactionCore.Collections.Discounts;
var Orders = ReactionCore.Collections.Orders;
var Shipping = ReactionCore.Collections.Shipping;
var Taxes = ReactionCore.Collections.Taxes;


/**
 * orders
 */

Meteor.publish('Orders', function(userId) {
  check(userId, Match.Optional(String));
  if (Roles.userIsInRole(this.userId, ['admin', 'owner'], ReactionCore.getShopId(this))) {
    return Orders.find({
      shopId: ReactionCore.getShopId(this)
    });
  } else {
    return [];
  }
});





/**
 * cart
 */

Meteor.publish('Cart', function(userId) {
  check(userId, Match.OptionalOrNull(String));
  if (!this.userId) {
    return;
  }
  return ReactionCore.Collections.Cart.find({
    userId: this.userId
  });
});



/**
 * shipping
 */

Meteor.publish("Shipping", function() {
  return Shipping.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * taxes
 */

Meteor.publish("Taxes", function() {
  return Taxes.find({
    shopId: ReactionCore.getShopId()
  });
});


/**
 * discounts
 */

Meteor.publish("Discounts", function() {
  return Discounts.find({
    shopId: ReactionCore.getShopId()
  });
});
