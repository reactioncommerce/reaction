import React from "react";
import { registerComponent } from "@reactioncommerce/reaction-components";


class InvoiceActionsApproved extends React.Component {
  render() {
    return (
      <div className="flex">
        <a
          className="btn btn-link"
          href={this.props.printOrder}
          target="_blank"
          data-i18n="app.print"
        >
          Print
        </a>

        <button
          className="btn btn-success flex-item-fill"
          type="button"
          data-event-action="capturePayment"
          disabled={this.props.isCapturing}
          onClick={this.props.handleCapturePayment}
        >

          {this.props.isCapturing ?
            <span id="btn-capture-payment">
                  Capturing <i className="fa fa-spinner fa-spin" id="btn-processing"/>
            </span> :
            <span id="btn-capture-payment" data-i18n="order.capturePayment">Capture Payment</span>
          }
        </button>
      </div>
    );
  }
}

registerComponent("InvoiceActionsApproved", InvoiceActionsApproved);

export default InvoiceActionsApproved;

