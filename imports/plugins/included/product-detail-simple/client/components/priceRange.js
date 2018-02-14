import React from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const PriceRange = (props) => (
  <div className="pdp price-range">
    <Components.Currency {...props} />
  </div>
);

registerComponent("PriceRange", PriceRange);

export default PriceRange;
