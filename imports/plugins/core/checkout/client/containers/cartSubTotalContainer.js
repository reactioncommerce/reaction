import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Cart } from "/lib/collections";
import CartSubTotal from "../components/cartSubTotal";

function composer(props, onData) {
  const cart = Cart.findOne();
  if (cart) {
    onData(null, {
      cartSubTotal: cart.subTotal(),
      cartCount: cart.count(),
      cartShipping: cart.shipping(),
      cartDiscount: cart.discounts(),
      cartTaxes: cart.taxes(),
      cartTotal: cart.total()
    });
  }
}

registerComponent("CartSubTotal", CartSubTotal, composeWithTracker(composer));

export default composeWithTracker(composer)(CartSubTotal);
