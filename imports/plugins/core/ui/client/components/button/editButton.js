import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Button from "./button.jsx";

class EditButton extends Component {
  render() {
    const {
      isEditing,
      ...otherProps
    } = this.props;

    let buttonClassName = classnames({
      "rui": true,
      "button": true,
      "edit": true,
      "variant-edit": true,
      "btn-success": isEditing
    });

    let iconClassName = classnames({
      "fa": true,
      "fa-lg": true,
      "fa-pencil": !isEditing,
      "fa-check": isEditing
    });

    return (
      <Button
        icon={iconClassName}
        className={buttonClassName}
        {...otherProps}
      />
    );
  }
}

EditButton.propTypes = {
  isEditing: PropTypes.bool
};

export default EditButton;
