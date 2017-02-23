/* eslint no-unused-vars: 1 */

import React, { Component } from "react";
import classnames from "classnames";
import Button from "./button.jsx";

class FlatButton extends Component {
  static defaultProps = {
    bezelStyle: "flat"
  }
  render() {
    const {
      icon,
      onIcon,
      ...otherProps
    } = this.props;

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
  }
}

FlatButton.propTypes = Object.assign({}, Button.propTypes);

export default FlatButton;
