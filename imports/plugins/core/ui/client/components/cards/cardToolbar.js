import React from "react";
import PropTypes from "prop-types";
import { pure } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";

const CardToolbar = ({ children }) => (
  <div className="rui card-toolbar">
    {children}
  </div>
);


CardToolbar.propTypes = {
  children: PropTypes.node
};

registerComponent("CardToolbar", CardToolbar, pure);

export default CardToolbar;
