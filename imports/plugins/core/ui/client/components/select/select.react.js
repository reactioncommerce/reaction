import React from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const Select = (props) => (
  <Components.MultiSelect
    multi={false}
    clearable={false}
    {...props}
  />
);

registerComponent("Select", Select);

export default Select;
