import React, { Component } from "react";
import PropTypes from "prop-types";
import { Session } from "meteor/session";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

class AddToCartButtonCustomer extends Component {
  componentDidUpdate(prevProps) {
    const {
      cartQuantity,
      catalogItemProduct: product,
      isLoadingAddCartItems,
      isLoadingCreateCart,
      selectedOptionId,
      selectedVariantId,
      onCartQuantityChange
    } = this.props;

    if ((prevProps.isLoadingAddCartItems && !isLoadingAddCartItems) || (prevProps.isLoadingCreateCart && !isLoadingCreateCart)) {
      onCartQuantityChange(null, 1);

      let selectedOption;
      const selectedVariant = product.variants.find((variant) => variant.variantId === selectedVariantId);
      if (selectedOptionId) {
        selectedOption = selectedVariant.options.find((option) => option.variantId === selectedOptionId);
      }
      const selectedVariantOrOption = selectedOption || selectedVariant;
      const addToCartText = i18next.t("productDetail.addedToCart");
      const addToCartTitle = selectedVariantOrOption.title;
      Session.set("cartAlertMessage", `${cartQuantity} ${addToCartTitle} ${addToCartText}`);
      Session.set("isCartAlertVisible", true);
      setTimeout(() => Session.set("isCartAlertVisible", false), 2000);
    }
  }

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
  catalogItemProduct: PropTypes.object,
  isLoadingAddCartItems: PropTypes.bool,
  isLoadingCreateCart: PropTypes.bool,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  selectedOptionId: PropTypes.string,
  selectedVariantId: PropTypes.string
};

registerComponent("AddToCartButtonCustomer", AddToCartButtonCustomer);

export default AddToCartButtonCustomer;
