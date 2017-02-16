import React, { Component } from "react";
import classnames from "classnames";
import Button from "./button.jsx";

class IconButton extends Component {
  static defaultProps = {
    bezelStyle: "solid"
  }

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
        "icon": true,
        "icon-only": true
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
  }
}

IconButton.propTypes = Object.assign({}, Button.propTypes);

export default IconButton;
