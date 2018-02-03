import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Checkbox extends Component {
  // Create a semi-random ID
  //
  // ID's are required for form controls and their labels for ARIA compliance.
  // This will be the default ID for this component unless once is passed in through props.
  _id = `checkbox-${Math.floor(Math.random() * 100000)}`

  get id() {
    return this.props.id || this._id;
  }

  handleChange = (event) => {
    if (this.props.onChange) {
      const isInputChecked = !this.props.checked;
      this.props.onChange(event, isInputChecked, this.props.name);
    }
  }

  renderLabel() {
    const { label, i18nKeyLabel } = this.props;
    if (label || i18nKeyLabel) {
      return (<Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />);
    }
    return null;
  }

  render() {
    return (
      <label htmlFor={this.id}>
        <input
          id={this.id}
          checked={this.props.checked}
          onChange={this.handleChange}
          className={this.props.className}
          ref="checkbox"
          type="checkbox"
          onBlur={this.props.onMouseOut}
          onMouseOut={this.props.onMouseOut}
        />
        <Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
      </label>
    );
  }
}

Checkbox.defaultProps = {
  checked: false
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  className: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onMouseOut: PropTypes.func
};

registerComponent("Checkbox", Checkbox);

export default Checkbox;
