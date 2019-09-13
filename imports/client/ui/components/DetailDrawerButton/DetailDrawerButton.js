import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { UIContext } from "../../context/UIContext";

/**
 * Detail drawer open button
 * @param {Object} props Component props
 * @returns {React.Component} Sidebar component
 */
function DetailDrawerButton(props) {
  const {
    component: ComponentProp,
    children,
    ...otherProps
  } = props;

  return (
    <UIContext.Consumer>
      {({ onToggleDetailDrawer }) => (
        <ComponentProp {...otherProps} onClick={onToggleDetailDrawer}>{children}</ComponentProp>
      )}
    </UIContext.Consumer>
  );
}

DetailDrawerButton.propTypes = {
  children: PropTypes.node,
  component: PropTypes.object
};

DetailDrawerButton.defaultProps = {
  component: Button
};

export default DetailDrawerButton;
