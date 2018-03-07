import { setTimeout } from "timers";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Cart } from "/lib/collections";
import CartSubTotal from "../components/cartSubTotal";

function composer(props, onData) {
  onData(null, {
    isLoading: true
  });
  setTimeout(() => {
    const cart = Cart.findOne();
    if (cart) {
      onData(null, {
        cartSubTotal: cart.getSubTotal(),
        cartCount: cart.getCount(),
        cartShipping: cart.getShippingTotal(),
        cartDiscount: cart.getDiscounts(),
        cartTaxes: cart.getTaxTotal(),
        cartTotal: cart.getTotal(),
        isLoading: false
      });
    }
  }, 200);
}

registerComponent("CartSubTotal", CartSubTotal, composeWithTracker(composer));

export default composeWithTracker(composer, Components.Loading)(CartSubTotal);
