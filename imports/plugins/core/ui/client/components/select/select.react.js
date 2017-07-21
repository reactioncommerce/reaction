import React, { PureComponent } from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Select extends PureComponent {
  render() {
    return (
      <Components.MultiSelect
        multi={false}
        clearable={false}
        {...this.props}
      />
    );
  }
}

registerComponent("Select", Select);

export default Select;
