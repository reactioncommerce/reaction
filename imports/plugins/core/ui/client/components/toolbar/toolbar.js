import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const Toolbar = ({ children }) => (
  <nav className="rui toolbar navbar-inverse">
    {children}
  </nav>
);

Toolbar.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node
};

Toolbar.defaultProps = {
  attachment: "top"
};

registerComponent("Toolbar", Toolbar);

export default Toolbar;
