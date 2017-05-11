import React, { PropTypes } from "react";
import CartSubTotals from "../container/cartSubTotalContainer";
import CartItems from "./cartItems";

const cartDrawer = ({ productItems, pdpPath, handleRemoveItem, handleCheckout, handleImage, handleLowInventory, handleShowProduct }) => {
  return (
    <div>
      <div className="cart-drawer-swiper-container">
        <div className="cart-drawer-swiper-wrapper">
          <div className="cart-drawer-swiper-slide">
            <CartSubTotals />
          </div>
          {productItems.map(item => {
            return (
              <div className="cart-drawer-swiper-slide" key={item._id}>
                <CartItems
                  item={item}
                  pdpPath={pdpPath}
                  handleLowInventory={handleLowInventory}
                  handleImage={handleImage}
                  handleRemoveItem={handleRemoveItem}
                  handleShowProduct={handleShowProduct}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="cart-drawer-pagination" />
      <div className="row">
        <span className="rui btn btn-cta btn-lg btn-block" id="btn-checkout" data-i18n="cartDrawer.checkout" onClick={handleCheckout}>
          Checkout now
          </span>
      </div>
    </div>
  );
};

cartDrawer.propTypes = {
  handleCheckout: PropTypes.func,
  handleImage: PropTypes.func,
  handleLowInventory: PropTypes.func,
  handleRemoveItem: PropTypes.func,
  handleShowProduct: PropTypes.func,
  pdpPath: PropTypes.func,
  productItems: PropTypes.array
};

export default cartDrawer;
