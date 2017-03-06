import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import { Orders } from "/lib/collections";
import Invoice from "../components/invoice.js";

class InvoiceContainer extends Component {
  render() {
    return (
      <TranslationProvider>
        <Invoice
          invoice={this.props.invoice}
        />
      </TranslationProvider>
    );
  }
}

InvoiceContainer.propTypes = {
  invoice: PropTypes.object
};

const composer = (props, onData) => {
  onData(null, {
    invoice: props.invoice
  });
};

export default composeWithTracker(composer, Loading)(InvoiceContainer);
