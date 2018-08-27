import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const PriceRangeCustomer = (props) => (
  <div className="pdp price-range">
    <span itemProp="price">{props.displayPrice}</span>
  </div>
);

PriceRangeCustomer.propTypes = {
  displayPrice: PropTypes.string
};

registerComponent("PriceRangeCustomer", PriceRangeCustomer);

export default PriceRangeCustomer;
