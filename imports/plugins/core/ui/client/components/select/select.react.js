import React from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const { MultiSelect } = Components;

const Select = (props) => (
  <MultiSelect
    multi={false}
    clearable={false}
    {...props}
  />
);

registerComponent("Select", Select);

export default Select;
