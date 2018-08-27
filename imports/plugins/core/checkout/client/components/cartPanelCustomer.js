import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class CartPanelCustomer extends Component {
  renderSpinner() {
    const { shouldDisplaySpinner } = this.props;
    if (shouldDisplaySpinner) {
      return (
        <span id="spin" >
          <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"
            style={{ marginBottom: "10px", marginTop: "10px", fontSize: "2.65em" }}
          />
        </span>
      );
    }
    return null;
  }

  render() {
    const { cartAlertMessage, checkout, onClick } = this.props;
    return (
      <div style={{ textAlign: "center" }}>
        {this.renderSpinner()}
        <div className="cart-alert-text">{cartAlertMessage}</div>
        <div className="cart-alert-checkout">
          <Components.Button
            id="btn-checkout"
            bezelStyle="solid"
            className="btn-lg btn-block"
            i18nKeyLabel="cartDrawer.checkout"
            label="Checkout now"
            onClick={onClick || checkout}
            status="success"
          />
        </div>
      </div>
    );
  }
}

CartPanelCustomer.propTypes = {
  cartAlertMessage: PropTypes.string,
  checkout: PropTypes.func,
  isAdmin: PropTypes.bool,
  onClick: PropTypes.func,
  shouldDisplaySpinner: PropTypes.bool
};

export default CartPanelCustomer;
