import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";

class Checkbox extends Component {
  handleChange = (event) => {
    if (this.props.onChange) {
      const isInputChecked = !this.props.checked;
      this.props.onChange(event, isInputChecked, this.props.name);
    }
  }

  renderLabel() {
    const { label, i18nKeyLabel } = this.props;
    if (label || i18nKeyLabel) {
      return (<Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />);
    }
    return null;
  }

  render() {
    return (
      <label>
        <input
          checked={this.props.checked}
          onChange={this.handleChange}
          className={this.props.className}
          ref="checkbox"
          type="checkbox"
        />
        {this.renderLabel()}
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
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func
};

export default Checkbox;
