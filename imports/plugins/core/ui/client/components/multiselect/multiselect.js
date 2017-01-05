import React, { Component, PropTypes } from "react";
import Select from "react-select";

class MultiSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || []
    };
  }

  handleOnChange(value) {
    this.setState({
      value
    });

    this.props.onChange(value);
  }

  render() {
    return (
      <Select
        multi
        simpleValue
        value={this.state.value}
        placeholder={this.props.placeholder}
        options={this.props.options}
        onChange={this.handleOnChange.bind(this)}
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
