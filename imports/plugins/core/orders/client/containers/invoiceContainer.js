import React, { Component, PropTypes } from "react";
import moment from "moment";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import Invoice from "../components/invoice.js";

class InvoiceContainer extends Component {
  static propTypes = {
    canMakeAdjustments: PropTypes.bool,
    collection: PropTypes.string,
    discounts: PropTypes.bool,
    invoice: PropTypes.object,
    isFetching: PropTypes.bool,
    orderId: PropTypes.string,
    paymentCaptured: PropTypes.bool,
    refunds: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.dateFormat = this.dateFormat.bind(this);
  }

  dateFormat = (context, block) => {
    const f = block || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }

  handleClick = (event) => {
    event.preventDefault();
    this.setState({
      isOpen: true
    });
  }

  render() {
    const {
      canMakeAdjustments, paymentCaptured,
      discounts, invoice, orderId, refunds,
      isFetching, collection
    } = this.props;

    return (
      <TranslationProvider>
        <Invoice
          canMakeAdjustments={canMakeAdjustments}
          paymentCaptured={paymentCaptured}
          isOpen={this.state.isOpen}
          discounts={discounts}
          handleClick={this.handleClick}
          invoice={invoice}
          orderId={orderId}
          refunds={refunds}
          dateFormat={this.dateFormat}
          isFetching={isFetching}
          collection={collection}
        />
      </TranslationProvider>
    );
  }
}

const composer = (props, onData) => {
  onData(null, {
    canMakeAdjustments: props.canMakeAdjustments,
    paymentCaptured: props.paymentCaptured,
    discounts: props.discounts,
    invoice: props.invoice,
    orderId: props.orderId,
    refunds: props.refunds,
    isFetching: props.isFetching,
    collection: props.collection
  });
};

export default composeWithTracker(composer, Loading)(InvoiceContainer);
