import React, { Component, PropTypes } from "react";

class TextArea extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { name, onChange } = this.props;
    onChange({ name, value: e.target.value });
  }

  render() {
    const { className, name, value, placeholder } = this.props;
    return (
      <textarea
        className={className}
        defaultValue={value}
        name={name}
        onBlur={this.handleChange}
        placeholder={placeholder}
      />
    );
  }
}

TextArea.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string
};

export default TextArea;
