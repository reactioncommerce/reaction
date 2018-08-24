import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

const CartIcon = ({ handleClick, cartItems }) => (
  <Components.Button
    tagName="div"
    className={{
      "btn": false,
      "btn-default": false,
      "cart-icon": true
    }}
    onClick={handleClick}
  >
    <span data-event-category="cart">
      <i className="fa fa-shopping-cart fa-2x" />
    </span>
    <div className="badge">{getItemsCount(cartItems) || 0}</div>
  </Components.Button>
);


function getItemsCount(cartItems) {
  if (cartItems && cartItems.length > 0) {
    return cartItems.reduce((sum, item) => sum + item.quantity || 0, 0);
  }
  return 0;
}

CartIcon.propTypes = {
  cartItems: PropTypes.array,
  handleClick: PropTypes.func.isRequired
};

export default CartIcon;
