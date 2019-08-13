import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @memberof Components
 * @param {Object} props component props
 * @returns {node} react element node
 */
const ToolbarGroup = (props) => {
  const baseClassName = classnames({
    "rui": true,
    "toolbar-group": true,
    "left": props.firstChild,
    "right": props.lastChild,
    "visible-mobile": props.visibleOnMobile
  }, props.className);

  return (
    <div className={baseClassName}>{props.children}</div>
  );
};

ToolbarGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  firstChild: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  lastChild: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  visibleOnMobile: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
};

registerComponent("ToolbarGroup", ToolbarGroup);

export default ToolbarGroup;
