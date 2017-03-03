import React, { Component } from "react";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { Translation } from "/imports/plugins/core/ui/client/components";

class Invoice extends Component {
  render() {
    return (
      <TranslationProvider>
        <div>
          <div className="">
            <strong>Quantity Total</strong>
          </div>
          <div className="">
            <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          </div>
          <div className="">
            <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          </div>
          <div className="">
            <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          </div>
          <div className="">
            <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
          </div>

        </div>
      </TranslationProvider>
    );
  }
}

export default Invoice;
