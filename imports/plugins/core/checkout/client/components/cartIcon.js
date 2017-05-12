import React, { Component } from "react";
import { Reaction } from "/client/api";

class CartIcon extends Component {
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
        <div className="badge">{this.props.cart ? this.props.cart.cartCount() : 0}</div>
      </div>
    );
  }
}

export default CartIcon;
