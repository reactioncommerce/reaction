import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import TotalActions from "../components/totalActions";
import { Loading } from "/imports/plugins/core/ui/client/components";

class TotalActionsContaner extends Component {
  constructor(props) {
    super(props);
    this.isAdjusted = this.isAdjusted.bind(this);
  }

  isAdjusted() {
    const { adjustedTotal, invoice } = this.props;

    if (invoice.total === adjustedTotal) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <div>
        <TotalActions
          isAdjusted={this.isAdjusted}
          paymentCaptured={this.props.paymentCaptured}
          adjustedTotal={this.props.adjustedTotal}
          invoice={this.props.invoice}
        />
      </div>
    );
  }
}

TotalActionsContaner.propTypes = {
  adjustedTotal: PropTypes.number,
  invoice: PropTypes.object,
  paymentCaptured: PropTypes.bool
};

const composer = (props, onData) => {
  onData(null, {
    paymentCaptured: props.paymentCaptured,
    adjustedTotal: props.adjustedTotal,
    invoice: props.invoice
  });
};

export default composeWithTracker(composer, Loading)(TotalActionsContaner);
