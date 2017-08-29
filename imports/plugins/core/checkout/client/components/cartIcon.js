import React from "react";
import PropTypes from "prop-types";

const CartIcon = ({ handleClick, cart }) => (
  <div className="cart-icon" onClick={handleClick}>
    <span data-event-category="cart">
      <i className="fa fa-shopping-cart fa-2x" />
    </span>
    <div className="badge">{cart ? cart.getCount() : 0}</div>
  </div>
);

CartIcon.propTypes = {
  cart: PropTypes.object,
  handleClick: PropTypes.func.isRequired
};

export default CartIcon;
