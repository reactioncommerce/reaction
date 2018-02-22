import React from "react";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";
import Button from "./button.jsx";

const IconButton = ({ icon, onIcon, ...otherProps }) => {
  // otherProps.buttonKind === 'flat'
  // default should be default, flat is new css that makes the background transparent.
  let buttonClassName;

  if (otherProps.kind === "flat") {
    buttonClassName = classnames({
      "icon": true,
      "icon-only": true
    });
  } else if (otherProps.kind === "mediaGalleryStatus") {
    buttonClassName = classnames({
      "icon": true,
      "icon-only": true,
      "status-badge": true
    });
  } else if (otherProps.kind === "removeItem") {
    buttonClassName = classnames({
      "icon-only": true,
      "variant-edit": true,
      "remove-item-aria-container": true
    });
  } else {
    buttonClassName = classnames({
      "icon-only": true,
      "variant-edit": true
    });
  }

  const iconClassName = classnames({
    "fa-lg": true,
    [icon]: true
  });

  let onIconClassName;

  if (onIcon) {
    onIconClassName = classnames({
      "fa-lg": true,
      [onIcon]: true
    });
  }

  return (
    <Button
      className={buttonClassName}
      icon={iconClassName}
      onIcon={onIconClassName}
      containerStyle={{ display: "flex", width: "100%", justifyContent: "center" }}
      {...otherProps}
    />
  );
};

IconButton.propTypes = { ...Button.propTypes };

IconButton.defaultProps = {
  bezelStyle: "solid"
};

registerComponent("IconButton", IconButton);

export default IconButton;
