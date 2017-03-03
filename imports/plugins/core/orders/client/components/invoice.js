import React, { Component } from "react";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
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
    return (
      <TranslationProvider>
        <div>
          <div className="form-group order-summary-form-group">
            <strong>Quantity Total</strong>
            <div className="invoice-details">
              0
            </div>
          </div>

          <div className="form-group order-summary-form-group">
            <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
            <div className="invoice-details">
              {this.currency(0.00)}
            </div>
          </div>

          <div className="form-group order-summary-form-group">
            <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
            <div className="invoice-details">
            </div>
          </div>

          <div className="form-group order-summary-form-group">
            <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
            <div className="invoice-details">
            </div>
          </div>

          <div className="form-group order-summary-form-group">
            <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
            <div className="invoice-details">
            </div>
          </div>

        </div>
      </TranslationProvider>
    );
  }
}

export default Invoice;
