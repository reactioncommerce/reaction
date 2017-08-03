import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";
import { IconButton, NumericInput, Translation, ButtonSelect } from "/imports/plugins/core/ui/client/components";

class InvoiceActions extends Component {
  static propTypes = {
    adjustedTotal: PropTypes.number,
    handleActionViewBack: PropTypes.func,
    invoice: PropTypes.object,
    isAdjusted: PropTypes.func
  }

  renderCapturedTotal() {
    const { invoice } = this.props;

    return (
      <div className="invoice-summary">
        <span  className="invoice-label captured-total">
          <strong><Translation defaultValue="Captured Total" i18nKey="admin.invoice.capturedTotal"/></strong>
        </span>

        <div className="invoice-details">
          <strong>{formatPriceString(invoice.total)}</strong>
        </div>
      </div>
    );
  }

  renderAdjustedTotal() {
    const { adjustedTotal } = this.props;

    return (
      <div className="invoice-summary">
        <span className="invoice-label adjusted-total">
          <strong><Translation defaultValue="Adjusted Total" i18nKey="admin.invoice.adjustedTotal"/></strong>
        </span>

        <div className="invoice-details">
          <strong>{formatPriceString(adjustedTotal)}</strong>
        </div>
      </div>
    );
  }
  renderRefundForm() {
    const { adjustedTotal } = this.props;

    return (
      <div className="invoice-summary">
        <span  className="invoice-label refund">
          <strong><Translation defaultValue="Refund" i18nKey="admin.invoice.refund"/></strong>
        </span>

        <div className="invoice-details">
          <span className="refundAmount">
            <NumericInput
              numericType="currency"
              value="0"
              maxValue={adjustedTotal}
              classNames="amount"
            />
          </span>
          <span className="refundSubmit">
            <IconButton
              bezelStyle={"flat"}
              icon="fa fa-arrow-circle-o-right"
              onClick={this.props.handleActionViewBack}
            />
            <span id="btn-refund-payment">-></span>
          </span>
        </div>
      </div>
    );
  }

  renderApproval() {
    return (
      <div>
        {this.props.paymentPendingApproval &&
          <div className="btn-block">
            <div>
              <ButtonSelect
                buttons= {[
                  {
                    name: "Approve",
                    i18nKeyLabel: "order.approveInvoice",
                    active: true,
                    status: "success",
                    eventAction: "approveInvoice",
                    bgColor: "bg-success",
                    buttonType: "submit"
                  }, {
                    name: "Cancel",
                    i18nKeyLabel: "order.cancelInvoice",
                    active: false,
                    status: "danger",
                    eventAction: "cancelOrder",
                    bgColor: "bg-danger",
                    buttonType: "button"
                  }
                ]}
              />
            </div>
          </div>
        }

        {this.props.paymentApproved &&
          <button className="btn btn-success flex-item-fill" type="button" data-event-action="capturePayment" disabled={this.props.capturedDisabled}>
            <span id="btn-capture-payment" data-i18n="order.capturePayment">Capture Payment</span>
            {/* <i class="fa fa-spinner fa-spin {{#unless isCapturing}}hidden{{/unless}}" id="btn-processing"></i> */}
          </button>
        }
      </div>
    );
  }

  render() {
    const { isAdjusted } = this.props;

    return (
      <div className="flex" style={{ marginBottom: 15 }}>
        {this.renderApproval()}
        {this.props.paymentCaptured &&
          <div>
            {this.renderCapturedTotal()}
            {isAdjusted() && this.renderAdjustedTotal()}
          </div>
        }
        {/* {this.renderRefundForm()} */}
      </div>
    );
  }
}

export default InvoiceActions;
