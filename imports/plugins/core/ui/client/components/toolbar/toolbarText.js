import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

/**
 * Toobar Text
 * @param {Object} props component props
 * @return {node} react element node
 */
const ToolbarText = (props) => {
  const baseClassName = classnames({
    "navbar-text": true
  }, props.className);

  return (
    <div className={baseClassName}>{props.children}</div>
  );
};

ToolbarText.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
};

export default ToolbarText;
