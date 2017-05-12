import React, { Component, PropTypes } from "react";

class CartPanel extends Component {
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <span id="spin" >
          <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"
            style={{ marginBottom: "10px", marginTop: "10px", fontSize: "2.65em" }}
          >{}
          </i>
        </span>
        <div className="cart-alert-text">{}</div>
        <div className="cart-alert-checkout">
          <span className="btn btn-success btn-lg btn-block" id="btn-checkout" data-i18n="cartDrawer.checkout"
            onClick={this.props.onClick || this.props.checkout}
          >
            Checkout now
         </span>
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
