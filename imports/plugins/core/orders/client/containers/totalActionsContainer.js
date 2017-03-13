import React, { Component, PropTypes } from "react";
import TotalActions from "../components/totalActions";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";

class TotalActionsContaner extends Component {
  render() {
    return (
      <div>
        <TotalActions
          canMakeAdjustments={this.props.canMakeAdjustments}
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
  canMakeAdjustments: PropTypes.bool,
  invoice: PropTypes.object,
  paymentCaptured: PropTypes.bool
};

const composer = (props, onData) => {
  onData(null, {
    canMakeAdjustments: props.canMakeAdjustments,
    paymentCaptured: props.paymentCaptured,
    adjustedTotal: props.adjustedTotal,
    invoice: props.invoice
  });
};

export default composeWithTracker(composer, Loading)(TotalActionsContaner);
