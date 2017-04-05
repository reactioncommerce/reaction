import React, { Component, PropTypes } from "react";

class CartPanel extends Component {
  render() {
    return (
      <div>
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
