import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Cart } from "/lib/collections";
import CartSubTotal from "../components/cartSubTotal";

function composer(props, onData) {
  const cart = Cart.findOne();
  if (cart) {
    onData(null, {
      cartSubTotal: cart.cartSubTotal(),
      cartCount: cart.cartCount(),
      cartShipping: cart.cartShipping(),
      cartDiscount: cart.cartDiscounts(),
      cartTaxes: cart.cartTaxes(),
      cartTotal: cart.cartTotal()
    });
  }
}

registerComponent("CartSubTotal", CartSubTotal, composeWithTracker(composer));

export default composeWithTracker(composer)(CartSubTotal);
