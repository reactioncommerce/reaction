import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

const CartDrawer = ({ productItems, pdpPath, handleRemoveItem, handleImage, handleShowProduct }) => (
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
              handleRemoveItem={handleRemoveItem}
              handleShowProduct={handleShowProduct}
            />
          </div>
        ))}
      </div>
    </div>
    <div className="cart-drawer-pagination" />
  </div>
);

CartDrawer.propTypes = {
  handleImage: PropTypes.func,
  handleRemoveItem: PropTypes.func,
  handleShowProduct: PropTypes.func,
  pdpPath: PropTypes.func,
  productItems: PropTypes.array
};

export default CartDrawer;
