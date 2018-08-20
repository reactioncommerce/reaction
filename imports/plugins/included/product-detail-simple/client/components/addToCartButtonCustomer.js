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
    const { catalogItemProduct: { variants } } = this.props;
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
            onClick={this.props.onAddToCart}
          >
            <Components.Translation defaultValue="Add to cart" i18nKey="productDetail.addToCart" />
          </button>
        </div>
      );
    }
    return null;
  }
}

AddToCartButtonCustomer.propTypes = {
  cartQuantity: PropTypes.number,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  catalogItemProduct: PropTypes.object
};

registerComponent("AddToCartButtonCustomer", AddToCartButtonCustomer);

export default AddToCartButtonCustomer;
