import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";

class CartSubTotal extends Component {
  static propTypes = {
    cartCount: PropTypes.number,
    cartDiscount: PropTypes.string,
    cartShipping: PropTypes.string,
    cartSubTotal: PropTypes.string,
    cartTaxes: PropTypes.string,
    cartTotal: PropTypes.string,
    isLoading: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      ...props
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...nextProps
    });
  }

  get source() {
    return this.props.isLoading ? this.state : this.props;
  }

  validateDiscount() {
    if (Number(this.source.cartDiscount) > 0) {
      return (
        <tr>
          <td><Components.Translation defaultValue="Discount" i18nKey="cartSubTotals.discount" /></td>
          <td><Components.Currency amount={this.source.cartDiscount} /></td>
        </tr>
      );
    }
  }
  validateShipping() {
    if (Number(this.source.cartShipping) > 0) {
      return (
        <tr>
          <td><Components.Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping" /></td>
          <td><Components.Currency amount={this.source.cartShipping} /></td>
        </tr>
      );
    }
  }
  validateTaxes() {
    if (Number(this.source.cartTaxes) > 0) {
      return (
        <tr>
          <td><Components.Translation defaultValue="Tax" i18nKey="cartSubTotals.tax" /></td>
          <td><Components.Currency amount={this.source.cartTaxes} /></td>
        </tr>
      );
    }
  }
  render() {
    const { isLoading } = this.props;
    const tableClass = classnames({
      "table": true,
      "table-condensed": true,
      "loading": isLoading
    });
    return (
      <div className="cart-items">
        <div className="cart-totals">
          { isLoading && <Components.Loading/> }
          <table className={tableClass}>
            <thead>
              <tr><th><Components.Translation defaultValue="Your cart" i18nKey="cartSubTotals.head" /></th></tr>
            </thead>
            <tbody>
              <tr>
                <td><Components.Translation defaultValue="Items in cart" i18nKey="cartSubTotals.items" /></td>
                <td>{this.source.cartCount}</td>
              </tr>
              <tr>
                <td><Components.Translation defaultValue="Sub total" i18nKey="cartSubTotals.subtotal" /></td>
                <td><Components.Currency amount={this.source.cartSubTotal} /></td>
              </tr>
              {this.validateDiscount()}
              {this.validateShipping()}
              {this.validateTaxes()}
              <tr>
                <td><Components.Translation defaultValue="Total" i18nKey="cartSubTotals.total" /></td>
                <td><Components.Currency amount={this.source.cartTotal} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default CartSubTotal;
