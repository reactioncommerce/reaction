import React from "react";
import { pure } from "recompose";
import { Components, registerComponent } from "@reaction/components";

const PriceRange = (props) => {
  return (
    <div className="pdp price-range">
      <Components.Currency {...props} />
    </div>
  );
};

registerComponent("PriceRange", PriceRange, pure);

export default PriceRange;
