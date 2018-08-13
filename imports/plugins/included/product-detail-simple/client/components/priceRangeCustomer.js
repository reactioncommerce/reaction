import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const PriceRangeCustomer = (props) => (
  <div className="pdp price-range">
    <span itemProp="price">{props.priceRange}</span>
  </div>
);

PriceRangeCustomer.propTypes = {
  priceRange: PropTypes.string
};

registerComponent("PriceRangeCustomer", PriceRangeCustomer);

export default PriceRangeCustomer;
