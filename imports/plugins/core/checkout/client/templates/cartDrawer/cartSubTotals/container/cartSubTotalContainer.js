import React, { Component } from "react";
import { Cart } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import CartSubTotal from "../component/cartSubTotal";

class CartSubTotalContainer extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     cartSubTotal: "0",
  //     cartCount: 0,
  //     cartShipping: "0",
  //     cartDiscount: "0",
  //     cartTaxes: "0",
  //     cartTotal: "0"
  //   };
  // }
  // componentWillMount() {
  //   const cart = Cart.findOne();
  //   if (cart) {
  //     this.setState({
  //       cartSubTotal: cart.cartSubTotal(),
  //       cartCount: cart.cartCount(),
  //       cartShipping: cart.cartShipping(),
  //       cartDiscount: cart.cartDiscounts(),
  //       cartTaxes: cart.cartTaxes(),
  //       cartTotal: cart.cartTotal()
  //     });
  //   }
  // }

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
