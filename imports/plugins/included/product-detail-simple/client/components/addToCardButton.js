import React, { Component, PropTypes } from "react";

class AddToCartButton extends Component {
  render() {
    return (
      <div className="pdp add-to-cart block">
        <input
          type="number"
          className="form-control input-md"
          name="addToCartQty"
          id="add-to-cart-quantity"
          value="1"
          min="1"
        />
        <button
          className="input-group-addon add-to-cart-text js-add-to-cart"
          data-i18n="productDetail.addToCart"
        >
          Add to cart
        </button>
      </div>
    );
  }
}

export default AddToCartButton;
