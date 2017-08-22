import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const CardToolbar = ({ children }) => (
  <div className="rui card-toolbar">
    {children}
  </div>
);


CardToolbar.propTypes = {
  children: PropTypes.node
};

registerComponent("CardToolbar", CardToolbar);

export default CardToolbar;
