import { setTimeout } from "timers";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CartSubTotal from "../components/cartSubTotal";

function composer(props, onData) {
  onData(null, {
    isLoading: true
  });

  let stopped = false;
  setTimeout(() => {
    if (stopped) return;
    if (props.cart) {
      const { totalItemQuantity: cartCount } = props.cart;
      const { summary = {} } = props.cart.checkout;
      const cartDiscount = summary.discountTotal && summary.discountTotal.amount;
      const cartSubTotal = summary.itemTotal && summary.itemTotal.amount;
      const cartShipping = summary.fulfillmentTotal && summary.fulfillmentTotal.amount;
      const cartTaxes = summary.taxTotal && summary.taxTotal.amount;
      const cartTotal = summary.total && summary.total.amount;
      onData(null, {
        cartSubTotal,
        cartCount,
        cartShipping,
        cartDiscount,
        cartTaxes,
        cartTotal,
        isLoading: false
      });
    }
  }, 200);

  return () => {
    stopped = true;
  };
}

const hocs = [
  composeWithTracker(composer)
];

registerComponent("CartSubTotalCustomer", CartSubTotal, hocs);

export default compose(...hocs)(CartSubTotal);
