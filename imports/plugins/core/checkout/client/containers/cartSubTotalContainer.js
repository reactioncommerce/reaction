import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Cart } from "/lib/collections";
import CartSubTotal from "../components/cartSubTotal";

function composer(props, onData) {
  const cart = Cart.findOne();
  if (cart) {
    onData(null, {
      cartSubTotal: cart.getSubTotal(),
      cartCount: cart.getCount(),
      cartShipping: cart.getShippingTotal(),
      cartDiscount: cart.getDiscounts(),
      cartTaxes: cart.getTaxTotal(),
      cartTotal: cart.getTotal()
    });
  }
}

registerComponent("CartSubTotal", CartSubTotal, composeWithTracker(composer));

export default composeWithTracker(composer)(CartSubTotal);
