import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const CardGroup = ({ children }) => (
  <div className="panel-group">
    {children}
  </div>
);

CardGroup.propTypes = {
  children: PropTypes.node
};

registerComponent("CardGroup", CardGroup);

export default CardGroup;
