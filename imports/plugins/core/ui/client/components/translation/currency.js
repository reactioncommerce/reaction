import React, { Component, PropTypes, Children } from "react"; // eslint-disable-line
import { formatPriceString } from "/client/api";

class Currency extends Component {
  render() {
    const amount = formatPriceString(this.props.amount);

    return (
      <span itemProp="price">{amount}</span>
    );
  }
}

Currency.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default Currency;
