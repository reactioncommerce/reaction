import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddToCartButtonCustomer extends Component {
  handleCartQuantityChange = (event) => {
    if (this.props.onCartQuantityChange) {
      this.props.onCartQuantityChange(event, event.target.value);
    }
  }

  render() {
    const { product: { variants } } = this.props;
    if (variants && variants.length > 0) {
      return (
        <div className="pdp add-to-cart block">
          <input
            className="form-control input-md"
            id="add-to-cart-quantity"
            min="1"
            name="addToCartQty"
            onChange={this.handleCartQuantityChange}
            type="number"
            value={this.props.cartQuantity}
          />
          <button
            className="input-group-addon add-to-cart-text js-add-to-cart"
            data-i18n="productDetail.addToCart"
            onClick={this.props.onClick || this.props.onAddToCart}
          >
            <Components.Translation defaultValue="Add to cart" i18nKey="productDetail.addToCart" />
          </button>
        </div>
      );
    }

    if (this.props.editable && this.hasVariants === false) {
      return (
        <Components.Alert>
          <Components.Translation defaultValue="Add options to enable 'Add to Cart' button" i18nKey="productVariant.addVariantOptions" />
        </Components.Alert>
      );
    }
    return null;
  }
}

AddToCartButtonCustomer.propTypes = {
  cartQuantity: PropTypes.number,
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onClick: PropTypes.func,
  product: PropTypes.object
};

registerComponent("AddToCartButtonCustomer", AddToCartButtonCustomer);

export default AddToCartButtonCustomer;
