import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reaction/components";

const Items = ({ children }) => (
  <div className="rui items">
    {children}
  </div>
);

Items.displayName = "Items";

Items.propTypes = {
  children: PropTypes.node
};

registerComponent("Items", Items);

export default Items;
