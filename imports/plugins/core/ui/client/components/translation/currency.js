import React from "react";
import PropTypes from "prop-types";
import { pure } from "recompose";
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

registerComponent("Currency", Currency, pure);

export default Currency;
