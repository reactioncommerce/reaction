import React, { Component, PropTypes } from "react";
import { Button } from "/imports/plugins/core/ui/client/components";

class CartPanel extends Component {
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <span id="spin" >
          <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"
            style={{ marginBottom: "10px", marginTop: "10px", fontSize: "2.65em" }}
          />
        </span>
        <div className="cart-alert-text">{}</div>
        <div className="cart-alert-checkout">
          <Button
            id="btn-checkout"
            bezelStyle="solid"
            className="btn-lg btn-block"
            i18nKeyLabel="cartDrawer.checkout"
            label="Checkout now"
            onClick={this.props.onClick || this.props.checkout}
            status="success"
          />
        </div>
      </div>
    );
  }
}

CartPanel.propTypes = {
  checkout: PropTypes.func,
  onClick: PropTypes.func
};

export default CartPanel;
