import React, { Component, PropTypes } from "react";

class TextBox extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { name, onChange } = this.props;
    onChange({ name, value: e.target.value });
  }

  render() {
    const { className, name, placeholder, value } = this.props;
    return (
      <input
        className={className}
        defaultValue={value}
        name={name}
        onBlur={this.handleChange}
        placeholder={placeholder}
        type="text"
      />
    );
  }
}

TextBox.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string
};

export default TextBox;
