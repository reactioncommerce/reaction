import React, { Component, PropTypes } from "react";
import Select from "react-select";

class MultiSelect extends Component {
  render() {
    return (
      <Select
        multi
        simpleValue
        value={this.props.value}
        placeholder={this.props.placeholder}
        options={this.props.options}
        onChange={this.props.onChange}
      />
    );
  }
}

MultiSelect.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
};

export default MultiSelect;
