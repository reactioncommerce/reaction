import React, { Component, PropTypes, Children } from "react"; // eslint-disable-line
import { registerComponent } from "@reactioncommerce/reaction-components";
import { formatPriceString } from "/client/api";

const Currency = ({ amount, priceRange, editable }) => (
  <span itemProp="price">{formatPriceString(amount || priceRange, editable)}</span>
);

Currency.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  editable: PropTypes.bool,
  priceRange: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

registerComponent("Currency", Currency);

export default Currency;
