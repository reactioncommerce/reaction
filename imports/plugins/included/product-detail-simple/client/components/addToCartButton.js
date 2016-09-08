import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";


class AddToCartButton extends Component {
  hanleCartQuantityChange = (event) => {
    if (this.props.onCartQuantityChange) {
      this.props.onCartQuantityChange(event, event.target.value);
    }
  }

  render() {
    return (
      <div className="pdp add-to-cart block">
        <input
          className="form-control input-md"
          id="add-to-cart-quantity"
          min="1"
          name="addToCartQty"
          onChange={this.hanleCartQuantityChange}
          type="number"
          value={this.props.cartQuantity}
        />
        <button
          className="input-group-addon add-to-cart-text js-add-to-cart"
          data-i18n="productDetail.addToCart"
          onClick={this.props.onClick}
        >
          <Translation defaultValue="Add to cart" i18nKey="productDetail.addToCart" />
        </button>
      </div>
    );
  }
}

AddToCartButton.propTypes = {
  cartQuantity: PropTypes.number,
  onCartQuantityChange: PropTypes.func,
  onClick: PropTypes.func
};

export default AddToCartButton;
