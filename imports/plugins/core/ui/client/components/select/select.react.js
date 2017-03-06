import React from "react";
import MultiSelect from "../multiselect/multiselect";

function Select(props) {
  return (
    <MultiSelect
      multi={false}
      {...props}
    />
  );
}

export default Select;
