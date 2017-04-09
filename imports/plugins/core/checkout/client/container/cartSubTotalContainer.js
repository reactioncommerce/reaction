import React, { Component } from "react";
import { Cart } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import CartSubTotal from "../components/cartSubTotal";

class CartSubTotalContainer extends Component {
  render() {
    return (
      <CartSubTotal
        {...this.props}
      />
    );
  }

}

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

export default composeWithTracker(composer, Loading)(CartSubTotalContainer);
