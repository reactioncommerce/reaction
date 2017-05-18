import React, { Component } from "react";
import PropTypes from "prop-types";
import { Currency, Translation } from "/imports/plugins/core/ui/client/components/";

class CartSubTotal extends Component {
  static propTypes = {
    cartCount: PropTypes.number,
    cartDiscount: PropTypes.string,
    cartShipping: PropTypes.string,
    cartSubTotal: PropTypes.string,
    cartTaxes: PropTypes.string,
    cartTotal: PropTypes.string
  }

  validateDiscount() {
    if (Number(this.props.cartDiscount) > 0) {
      return (
        <tr>
          <td><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount" /></td>
          <td><Currency amount={this.props.cartDiscount} /></td>
        </tr>
      );
    }
  }
  validateShipping() {
    if (Number(this.props.cartShipping) > 0) {
      return (
        <tr>
          <td><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping" /></td>
          <td><Currency amount={this.props.cartShipping} /></td>
        </tr>
      );
    }
  }
  validateTaxes() {
    if (Number(this.props.cartTaxes) > 0) {
      return (
        <tr>
          <td><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax" /></td>
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
            <thead>
              <tr><th><Translation defaultValue="Your cart" i18nKey="cartSubTotals.head" /></th></tr>
            </thead>
            <tbody>
              <tr>
                <td><Translation defaultValue="Items in cart" i18nKey="cartSubTotals.items" /></td>
                <td>{this.props.cartCount}</td>
              </tr>
              <tr>
                <td><Translation defaultValue="Sub total" i18nKey="cartSubTotals.subtotal" /></td>
                <td><Currency amount={this.props.cartSubTotal} /></td>
              </tr>
              {this.validateDiscount()}
              {this.validateShipping()}
              {this.validateTaxes()}
              <tr>
                <td><Translation defaultValue="Total" i18nKey="cartSubTotals.total" /></td>
                <td><Currency amount={this.props.cartTotal} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CartSubTotal;
