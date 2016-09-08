import React, { Component, PropTypes } from "react";

class Select extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { name, onChange } = this.props;
    onChange({ name, value: e.target.value });
  }

  render() {
    const { className, name, value, options } = this.props;
    return (
      <select
        className={className}
        defaultValue={value}
        name={name}
        onBlur={this.handleChange}
        type="text"
      >
        { options.map(o => <option key={`key-${o}`} value={o}>{o}</option>) }
      </select>
    );
  }
}

Select.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string
};

export default Select;
