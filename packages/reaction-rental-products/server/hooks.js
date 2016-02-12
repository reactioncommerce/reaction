ReactionCore.MethodHooks.beforeMethods({
  'cart/addToCart': function (options) {
    check(options.arguments, [Match.Any]);
    product = ReactionCore.Collections.Products.findOne(options.arguments[1]);

    // mutate price of object if rental
    if (product.type === 'rental') {
      cart = ReactionCore.Collections.Cart.findOne(options.arguments[0]);
      if (!cart.rentalDays) {
        cart.rentalDays = 1;
      }
      options.arguments[2] = _.omit(options.arguments[2], ['unavailableDates', 'active']);
      options.arguments[2].price = options.arguments[2].pricePerDay * cart.rentalDays;
    }
    return true;
  },
  'orders/inventoryAdjust': function (options) {
    check(options.arguments, [Match.Any]);
    const orderId = options.arguments[0];
    if (!orderId) { return true; }

    Meteor.call('rentalProducts/inventoryAdjust', orderId);

    return false;
  }
});
