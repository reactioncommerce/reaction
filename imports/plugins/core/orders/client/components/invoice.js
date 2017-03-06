import React, { Component } from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";

class Invoice extends Component {

  render() {
    return (
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
            0.00
          </div>
        </div>

        <div className="form-group order-summary-form-group">
          <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            0.00
          </div>
        </div>

        <div className="form-group order-summary-form-group">
          <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          <div className="invoice-details">
            0.00
          </div>
        </div>

        <div className="form-group order-summary-form-group">
          <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
          <div className="invoice-details">
            0.00
          </div>
        </div>
      </div>
    );
  }
}

export default Invoice;
