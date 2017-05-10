import React, { PropTypes } from "react";

const EmptyCartDrawer = ({ keepShopping }) => {
  return (
    <div className="cart-drawer" id="cart-drawer">
      <div className="cart-drawer-empty">
        <div className="row cart-drawer-empty-msg">
          <h1 className="text-align">
            <i className="fa fa-frown-o fa-lg" /><strong><p data-i18n="cartDrawer.empty">We&#8217re sad. Your cart is empty.</p></strong>
          </h1>
        </div>
        <div className="row">
          <a href="#" className="btn btn-warning btn-lg btn-block" id="btn-keep-shopping" data-i18n="cartDrawer.keepShopping"
            onClick={keepShopping}
          >
            Keep Shopping
        </a>
        </div>
      </div>
    </div>
  );
};

EmptyCartDrawer.propTypes = {
  keepShopping: PropTypes.func
};

export default EmptyCartDrawer;
