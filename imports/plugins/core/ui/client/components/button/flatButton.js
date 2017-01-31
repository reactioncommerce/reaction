/* eslint no-unused-vars: 1 */
//
// TODO review PropTypes import in flatButton.js
//
import React, { Component, PropTypes } from "react";
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
      bordered,
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
        "fa-lg": false,
        [icon]: true
      });
    }


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

FlatButton.propTypes = Object.assign({}, Button.propTypes);

export default FlatButton;
