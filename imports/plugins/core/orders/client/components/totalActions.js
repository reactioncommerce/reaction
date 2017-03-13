import React, { Component } from "react";
import { formatPriceString } from "/client/api";

class TotalActions extends Component {
  constructor(props) {
    super(props);
    this.renderAdjustedTotal = this.renderAdjustedTotal.bind(this);
    this.renderCapturedTotal = this.renderCapturedTotal.bind(this);
  }

  renderCapturedTotal() {
    return (
      <div className="order-summary-form-group bg-success" style={{ lineHeight: 3, marginTop: 10 }}>
        <span>
          <strong className="text-success">CAPTURED TOTAL</strong>
        </span>
        <div className="invoice-details">
          <i className="fa fa-check text-success" style={{ marginRight: 4 }} />
          <strong>{formatPriceString(this.props.invoice.total)}</strong>
        </div>
      </div>
    );
  }

  renderAdjustedTotal() {
    return (
      <div className="order-summary-form-group bg-danger" style={{ marginTop: 2, lineHeight: 3 }}>
        <span className="text-danger">
          <strong>ADJUSTED TOTAL</strong>
        </span>
        <div className="invoice-details">
          <i className="fa fa-check text-danger" style={{ marginRight: 4 }} />
          <strong>{formatPriceString(this.props.adjustedTotal)}</strong>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderCapturedTotal()}
        {this.renderAdjustedTotal()}
      </div>
    );
  }
}

export default TotalActions;
