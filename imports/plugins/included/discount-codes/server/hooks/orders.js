import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";
import { MethodHooks } from "/server/api";

// this hook runs before a cart is converted to an order
// it looks at any discounts that have been applied to the cart
// and updates the discount document with a transaction history
MethodHooks.before("cart/copyCartToOrder", (options) => {
  const cartId = options.arguments[0];
  const cart = Cart.findOne(cartId);
  // record that discounts have been applied to order
  if (cart && cart.billing) {
    for (const billing of cart.billing) {
      // TODO should we enable transactions for rates as well?
      if (billing.paymentMethod && billing.paymentMethod.processor === "code") {
        Meteor.call("discounts/transaction", cartId, billing.paymentMethod.id);
      }
    }
  }
});
