import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import TotalActions from "../components/totalActions";
import { Loading } from "/imports/plugins/core/ui/client/components";

class TotalActionsContaner extends Component {

  static propTypes = {
    adjustedTotal: PropTypes.number,
    invoice: PropTypes.object,
    paymentCaptured: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.isAdjusted = this.isAdjusted.bind(this);
  }

  isAdjusted = () => {
    const { adjustedTotal, invoice } = this.props;

    if (invoice.total === adjustedTotal) {
      return false;
    }
    return true;
  }

  render() {
    const  { paymentCaptured, adjustedTotal, invoice } =  this.props;
    return (
      <div>
        <TotalActions
          isAdjusted={this.isAdjusted}
          paymentCaptured={paymentCaptured}
          adjustedTotal={adjustedTotal}
          invoice={invoice}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  onData(null, {
    paymentCaptured: props.paymentCaptured,
    adjustedTotal: props.adjustedTotal,
    invoice: props.invoice
  });
};

export default composeWithTracker(composer, Loading)(TotalActionsContaner);
