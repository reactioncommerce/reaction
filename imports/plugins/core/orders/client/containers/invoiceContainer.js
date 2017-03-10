import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import moment from "moment";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import Invoice from "../components/invoice.js";

class InvoiceContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.dateFormat = this.dateFormat.bind(this);
  }

  dateFormat(context, block) {
    const f = block || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }

  handleClick(event) {
    event.preventDefault();
    this.setState({
      isOpen: true
    });
  }

  render() {
    return (
      <TranslationProvider>
        <Invoice
          isOpen={this.state.isOpen}
          handleClick={this.handleClick}
          invoice={this.props.invoice}
          orderId={this.props.orderId}
          canMakeAdjustments={this.props.canMakeAdjustments}
          paymentCaptured={this.props.paymentCaptured}
          adjustedTotal={this.props.adjustedTotal}
          refunds={this.props.refunds}
          dateFormat={this.dateFormat}
          isFetching={this.props.isFetching}
          collection={this.props.collection}
        />
      </TranslationProvider>
    );
  }
}

InvoiceContainer.propTypes = {
  adjustedTotal: PropTypes.number,
  canMakeAdjustments: PropTypes.bool,
  collection: PropTypes.string,
  invoice: PropTypes.object,
  isFetching: PropTypes.bool,
  orderId: PropTypes.string,
  paymentCaptured: PropTypes.bool,
  refunds: PropTypes.array
};

const composer = (props, onData) => {
  onData(null, {
    invoice: props.invoice,
    orderId: props.orderId,
    canMakeAdjustments: props.canMakeAdjustments,
    paymentCaptured: props.paymentCaptured,
    adjustedTotal: props.adjustedTotal,
    refunds: props.refunds,
    isFetching: props.isFetching,
    collection: props.collection
  });
};

export default composeWithTracker(composer, Loading)(InvoiceContainer);
