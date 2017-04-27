import React, { Component, PropTypes } from "react";
import { Currency } from "/imports/plugins/core/ui/client/components/";

class CartSubTotal extends Component {
  validateDiscount() {
    if (Number(this.props.cartDiscount) > 0) {
      return (
        <tr>
          <td data-i18n="cartSubTotals.discount">Discount</td>
          <td><Currency amount={this.props.cartDiscount} /></td>
        </tr>
      );
    }
  }
  validateShipping() {
    if (Number(this.props.cartShipping) > 0) {
      return (
        <tr>
          <td data-i18n="cartSubTotals.shipping">Shipping</td>
          <td><Currency amount={this.props.cartShipping} /></td>
        </tr>
      );
    }
  }
  validateTaxes() {
    if (Number(this.props.cartTaxes) > 0) {
      return (
        <tr>
          <td data-i18n="cartSubTotals.tax">Tax</td>
          <td><Currency amount={this.props.cartTaxes} /></td>
        </tr>
      );
    }
  }
  render() {
    return (
      <div className="cart-items">
        <div className="cart-totals">
          <table className="table table-condensed">
            <thead data-i18n="cartSubTotals.head">
              <tr><th>Your cart</th></tr>
            </thead>
            <tbody>
              <tr><td data-i18n="cartSubTotals.items">Items in cart</td><td>{this.props.cartCount}</td></tr>
              <tr><td data-i18n="cartSubTotals.subtotal">Sub total</td><td><Currency amount={this.props.cartSubTotal} /></td></tr>
              {this.validateDiscount()}
              {this.validateShipping()}
              {this.validateTaxes()}
              <tr><td data-i18n="cartSubTotals.total">Total</td><td><Currency amount={this.props.cartTotal} /></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

CartSubTotal.propTypes = {
  cartCount: PropTypes.number,
  cartDiscount: PropTypes.string,
  cartShipping: PropTypes.string,
  cartSubTotal: PropTypes.string,
  cartTaxes: PropTypes.string,
  cartTotal: PropTypes.string
};

export default CartSubTotal;
