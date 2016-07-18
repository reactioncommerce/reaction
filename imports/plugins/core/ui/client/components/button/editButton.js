import React, { Component, PropTypes } from "react";
import classnames from "classnames";

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
      <button
        className={buttonClassName}
        {...otherProps}
      >
        <span className="icon">
          <i className={iconClassName}></i>
        </span>
      </button>
    );
  }
}

EditButton.propTypes = {
  isEditing: PropTypes.bool
};

export default EditButton;
