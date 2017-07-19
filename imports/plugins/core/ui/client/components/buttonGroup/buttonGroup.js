import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { pure } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";

const ButtonGroup = () => {
  const baseClassName = classnames({
    "rui": true,
    "btn-group": true
  });

  return (
    <div className={baseClassName}>
      {this.props.children}
    </div>
  );
};

ButtonGroup.propTypes = {
  children: PropTypes.node
};

registerComponent("ButtonGroup", ButtonGroup, pure);

export default ButtonGroup;
