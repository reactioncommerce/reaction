import React, { PropTypes } from "react";
import { Button, Translation } from "/imports/plugins/core/ui/client/components";


const EmptyCartDrawer = ({ keepShopping }) => {
  return (
    <div className="cart-drawer" id="cart-drawer">
      <div className="cart-drawer-empty">
        <div className="row cart-drawer-empty-msg">
          <p className="text-align">
            <i className="fa fa-frown-o fa-lg" />
          </p>
          <p className="text-align">
            <Translation defaultValue="We're sad. Your cart is empty." i18nKey="cartDrawer.empty" />
          </p>
        </div>
        <div className="row">
          <Button
            id="btn-keep-shopping"
            bezelStyle="solid"
            className="btn-lg btn-block"
            i18nKeyLabel="cartDrawer.keepShopping"
            label="Keep on shopping"
            onClick={keepShopping}
            status="warning"
          />
        </div>
      </div>
    </div>
  );
};

EmptyCartDrawer.propTypes = {
  keepShopping: PropTypes.func
};

export default EmptyCartDrawer;
