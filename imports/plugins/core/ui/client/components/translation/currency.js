import React, { Component, PropTypes, Children } from "react"; // eslint-disable-line
import { formatPriceString } from "/client/api";
import camelcase from "lodash/camelcase";

class Currency extends Component {
  render() {
    const amount = formatPriceString(this.props.amount)

    // const translation = i18next.t(key, {
    //   defaultValue: this.props.defaultValue
    // })
    return (
      <span itemProp="price">{amount}</span>
    );
  }
}

Currency.propTypes = {
  amount: PropTypes.oneOf(PropTypes.number, PropTypes.string)
};

export default Currency;
