import React, { Component, PropTypes } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";
// import { NumericInput } from "/imports/plugins/core/ui/client/components";
import { formatNumber } from "/client/api";


class Invoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.currency = this.currency.bind(this);
  }

  currency(price) {
    return formatNumber(price);
  }

  render() {
    const invoice = this.props.invoice;

    return (
      <div>
        <div className="order-summary-form-group">
          <strong>Quantity Total</strong>
          <div className="invoice-details">
            0
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
            {invoice.subtotal}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            {invoice.shipping}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          <div className="invoice-details">
            {invoice.taxes}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
          <div className="invoice-details">
            <i className="fa fa-tag fa-lg"/> <a>Add Discount</a>
          </div>
        </div>
      </div>
    );
  }
}

Invoice.propTypes = {
  invoice: PropTypes.object
};

export default Invoice;
