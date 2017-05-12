import React, { Component } from "react";
import { Cart } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import CartIcon from "../components/cartIcon";

class CartIconContainer extends Component {
  render() {
    return (
      <div>
        <CartIcon {...this.props}/>
      </div>
    );
  }
}

const composer = (props, onData) => {
  const subscription = Reaction.Subscriptions.Cart;

  if (subscription.ready()) {
    const cart = Cart.findOne();

    onData(null, {
      cart: cart
    });
  }
};

export default composeWithTracker(composer, null)(CartIconContainer);
