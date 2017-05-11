import React, { Component } from "react";
import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";

class CartIcon extends Component {
  cartCount() {
    return Cart.findOne().cartCount();
  }

  handleClick = (event) => {
    event.preventDefault();
    return $("#cart-drawer-container").fadeOut(300, function () {
      return Reaction.toggleSession("displayCart");
    });
  }

  render() {
    return (
      <div className="cart-icon" onClick={this.handleClick}>
        <span data-event-category="cart">
          <i className="fa fa-shopping-cart fa-2x" />
        </span>
        <div className="badge">{this.cartCount()}</div>
      </div>
    );
  }
}

export default CartIcon;
