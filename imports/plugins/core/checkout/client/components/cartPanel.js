import React from "react";
import { registerComponent } from "@reactioncommerce/reaction-components";

const CartPanel = () => (
  <div style={{ textAlign: "center" }}>
    <span id="spin" >
      <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"
        style={{ marginBottom: "10px", marginTop: "10px", fontSize: "2.65em" }}
      />
    </span>
    <div className="cart-alert-text">{}</div>
  </div>
);

registerComponent("CartPanel", CartPanel);

export default CartPanel;
