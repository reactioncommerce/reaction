import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const Item = ({ children }) => (
  <div className="rui item">
    {children}
  </div>
);

Item.displayName = "Item";

Item.propTypes = {
  children: PropTypes.node
};

registerComponent("Item", Item);

export default Item;
