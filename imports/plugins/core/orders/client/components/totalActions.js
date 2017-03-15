import React, { Component, PropTypes } from "react";
import { formatPriceString } from "/client/api";

class TotalActions extends Component {
  constructor(props) {
    super(props);
    this.renderAdjustedTotal = this.renderAdjustedTotal.bind(this);
    this.renderCapturedTotal = this.renderCapturedTotal.bind(this);
  }

  renderCapturedTotal() {
    return (
      <div className="order-summary-form-group bg-success" style={{ lineHeight: 3, marginRight: -15, marginLeft: -15 }}>
        <span style={{ marginLeft: 15 }}>
          <strong className="text-success">CAPTURED TOTAL</strong>
        </span>

        <div className="invoice-details" style={{ marginRight: 15 }}>
          <strong>{formatPriceString(this.props.invoice.total)}</strong>
        </div>
      </div>
    );
  }

  renderAdjustedTotal() {
    return (
      <div className="order-summary-form-group bg-danger" style={{ marginTop: 2, lineHeight: 3, marginRight: -15, marginLeft: -15 }}>
        <span className="text-danger" style={{ marginLeft: 15 }}>
          <strong>ADJUSTED TOTAL</strong>
        </span>

        <div className="invoice-details" style={{ marginRight: 15 }}>
          <strong>{formatPriceString(this.props.adjustedTotal)}</strong>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderCapturedTotal()}
        {this.props.isAdjusted() && this.renderAdjustedTotal()}
      </div>
    );
  }
}

TotalActions.propTypes = {
  adjustedTotal: PropTypes.number,
  invoice: PropTypes.object,
  isAdjusted: PropTypes.func
};

export default TotalActions;
