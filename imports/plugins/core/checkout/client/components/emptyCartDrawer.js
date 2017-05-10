import React, { PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";


const EmptyCartDrawer = ({ keepShopping }) => {
  return (
    <div className="cart-drawer" id="cart-drawer">
      <div className="cart-drawer-empty">
        <div className="row cart-drawer-empty-msg">
          <p className="text-align">
            <i className="fa fa-frown-o fa-lg" />
          </p>
          <p className="text-align">
            <Translation defaultValue="We're sad. Your cart is empty." i18nKey="cartDrawer.empty"/>
          </p>
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
