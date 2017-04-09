import React, { Component } from "react";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import CartSubTotals from "../container/cartSubTotalContainer";
import CartItems from "../container/cartItemContainer";

class CartDrawerContainer extends Component {
  handleCheckout() {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
  render() {
    return (
      <div>
        <div className="cart-drawer-swiper-container">
          <div className="cart-drawer-swiper-wrapper">
            <div className="cart-drawer-swiper-slide">
              <CartSubTotals />
            </div>
            <div>
              <CartItems />
            </div>
          </div>
        </div>
        <div className="cart-drawer-pagination">{}</div>
        <div className="row">
          <span className="rui btn btn-cta btn-lg btn-block" id="btn-checkout" data-i18n="cartDrawer.checkout" onClick={this.handleCheckout}>
            Checkout now
          </span>
        </div>
      </div>
    );
  }
}

export default CartDrawerContainer;
