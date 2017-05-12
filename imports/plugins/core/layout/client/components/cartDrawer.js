import React, { Component } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";

class CartDrawer extends Component {
  render() {
    return (
      <Blaze template="cartDrawer" className="reaction-cart-drawer" />
    );
  }
}

export default CartDrawer;
