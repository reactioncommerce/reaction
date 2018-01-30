import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

const CartIcon = ({ handleClick, cart }) => (
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
    <div className="badge">{cart ? cart.getCount() : 0}</div>
  </Components.Button>
);

CartIcon.propTypes = {
  cart: PropTypes.object,
  handleClick: PropTypes.func.isRequired
};

export default CartIcon;
