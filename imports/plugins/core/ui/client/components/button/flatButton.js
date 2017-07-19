import React from "react";
import classnames from "classnames";
import { pure } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import Button from "./button.jsx";

const FlatButton = ({ icon, onIcon, ...otherProps }) => {
  const buttonClassName = classnames({
    rui: true,
    button: true
  });

  let iconClassName;
  let onIconClassName;

  if (icon) {
    iconClassName = classnames({
      [icon]: true
    });
  }

  if (onIcon) {
    onIconClassName = classnames({
      [onIcon]: true
    });
  }

  return (
    <Button
      className={buttonClassName}
      icon={iconClassName}
      onIcon={onIconClassName}
      {...otherProps}
    />
  );
};

FlatButton.propTypes = Object.assign({}, Button.propTypes);

FlatButton.defaultProps = {
  bezelStyle: "flat"
};

registerComponent("FlatButton", FlatButton, pure);

export default FlatButton;
