import React, { Component } from "react";
import { Reaction } from "/client/api";
import CartPanel from "../component/cartPanel";

class CartPanelContainer extends Component {
  handleCheckout() {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
  render() {
    return (
      <CartPanel
        checkout={this.handleCheckout}
      />
    );
  }
}

export default CartPanelContainer;
