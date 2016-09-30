import React, { Component } from "react";
import classnames from "classnames";
import Button from "./button.jsx";

class IconButton extends Component {
  render() {
    const {
      icon,
      onIcon,
      ...otherProps
    } = this.props;


    // this.props.buttonKind === 'flat'
    // default should be default, flat is new css that makes the bakcground tarnsparent
    let buttonClassName;

    if (this.props.kind === "flat") {
      buttonClassName = classnames({
        "rui": true,
        "button": true,
        "icon": true,
        "icon-only": true,
        "flat": true
      });
    } else if (this.props.kind === "close") {
      buttonClassName = classnames({
        "rui": true,
        "button": true,
        "icon-only": true,
        "close": true
      });
    } else {
      buttonClassName = classnames({
        "rui": true,
        "button": true,
        "edit": true,
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
        {...otherProps}
      />
    );
  }
}

IconButton.propTypes = Object.assign({}, Button.propTypes);

export default IconButton;
