import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";

class TotalActions extends Component {
  static propTypes = {
    adjustedTotal: PropTypes.number,
    invoice: PropTypes.object,
    isAdjusted: PropTypes.func
  }

  renderCapturedTotal() {
    const { invoice } = this.props;

    return (
      <div className="order-summary-form-group bg-success" style={{ lineHeight: 3, marginRight: -15, marginLeft: -15 }}>
        <span style={{ marginLeft: 15 }}>
          <strong className="text-success">CAPTURED TOTAL</strong>
        </span>

        <div className="invoice-details" style={{ marginRight: 15 }}>
          <strong>{formatPriceString(invoice.total)}</strong>
        </div>
      </div>
    );
  }

  renderAdjustedTotal() {
    const { adjustedTotal } = this.props;

    return (
      <div className="order-summary-form-group bg-danger" style={{ marginTop: 2, lineHeight: 3, marginRight: -15, marginLeft: -15 }}>
        <span className="text-danger" style={{ marginLeft: 15 }}>
          <strong>ADJUSTED TOTAL</strong>
        </span>

        <div className="invoice-details" style={{ marginRight: 15 }}>
          <strong>{formatPriceString(adjustedTotal)}</strong>
        </div>
      </div>
    );
  }

  render() {
    const { isAdjusted } = this.props;

    return (
      <div>
        {this.renderCapturedTotal()}
        {isAdjusted() && this.renderAdjustedTotal()}
      </div>
    );
  }
}

export default TotalActions;
