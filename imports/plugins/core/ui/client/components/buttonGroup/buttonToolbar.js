import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { pure } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";

const ButtonToolbar = () => {
  const baseClassName = classnames({
    "rui": true,
    "btn-toolbar": true
  });

  return (
    <div className={baseClassName}>
      {this.props.children}
    </div>
  );
};

ButtonToolbar.propTypes = {
  children: PropTypes.node
};

registerComponent("ButtonToolbar", ButtonToolbar, pure);

export default ButtonToolbar;
