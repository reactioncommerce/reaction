import React, { Component } from "react";
import MultiSelect from "../multiselect/multiselect";

class Select extends Component {
  render() {
    return (
      <MultiSelect
        multi={false}
        clearable={false}
        {...this.props}
      />
    );
  }
}

export default Select;
