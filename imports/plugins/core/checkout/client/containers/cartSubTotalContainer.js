import { registerComponent } from "@reactioncommerce/reaction-components";
import { Cart } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
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
  } else {
    onData(null, {});
  }
}

registerComponent("CartSubTotal", CartSubTotal, composeWithTracker(composer));

export default composeWithTracker(composer)(CartSubTotal);
