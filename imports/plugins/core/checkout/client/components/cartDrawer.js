import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import trackCartItems from "/imports/plugins/core/ui/client/tracking/trackCartItems";

class CartDrawer extends Component {
  static propTypes = {
    cartId: PropTypes.string,
    handleCheckout: PropTypes.func,
    handleImage: PropTypes.func,
    handleRemoveItem: PropTypes.func,
    handleShowProduct: PropTypes.func,
    pdpPath: PropTypes.func,
    productItems: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func
    })
  };

  componentDidMount() {
    const { cartId, productItems, tracking } = this.props;

    trackCartItems(tracking, {
      action: "Cart Viewed",
      cartId,
      cartItemOrItems: productItems
    });
  }

  handleRemoveItem = (event, item) => {
    const { cartId, handleRemoveItem, tracking } = this.props;

    trackCartItems(tracking, {
      action: "Product Removed",
      cartId,
      cartItemOrItems: item
    });

    handleRemoveItem(event, item);
  };

  render() {
    const { productItems, pdpPath, handleCheckout, handleImage, handleShowProduct } = this.props;
    return (
      <div>
        <div className="cart-drawer-swiper-container">
          <div className="cart-drawer-swiper-wrapper">
            <div className="cart-drawer-swiper-slide">
              <Components.CartSubTotal />
            </div>
            {productItems.map((item) => (
              <div className="cart-drawer-swiper-slide" key={item._id}>
                <Components.CartItems
                  item={item}
                  pdpPath={pdpPath}
                  handleImage={handleImage}
                  handleRemoveItem={this.handleRemoveItem}
                  handleShowProduct={handleShowProduct}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="cart-drawer-pagination" />
        <div className="row">
          <Components.Button
            bezelStyle="solid"
            className={{
              "btn-lg": true,
              "btn-block": true
            }}
            status="cta"
            id="btn-checkout"
            label="Checkout now"
            i18nKeyLabel="cartDrawer.checkout"
            onClick={handleCheckout}
          />
        </div>
      </div>
    );
  }
}

export default CartDrawer;
