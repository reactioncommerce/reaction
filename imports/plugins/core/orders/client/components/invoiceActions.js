import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

/**
 * @file InvoiceActions React Component for displaying the actionable data on the invoice section on the orders sideview
 *
 * @module InvoiceActions
 * @extends Component
 */

class InvoiceActions extends Component {
  /**
   * @name InvoiceActions propTypes
   * @summary React component for displaying the actionable data on the invoice section on the orders sideview
   * @param {Object} props - React PropTypes
   * @property {Object} invoice - An object representing an invoice
   * @property {Array} refunds - An array/list of refunds
   * @property {Function} handleApprove - A function for approving payments
   * @property {Function} handleCapturePayment - A function for capturing payments
   * @property {Function} handleRefund - A function for refunding payments
   * @property {Object} currency - A object represting current shop currency details
   * @property {String} printOrder - A string representing the route/path for printed order
   * @property {Number} adjustedTotal - The calculated adjusted total after refunds/discounts
   * @property {Bool} paymentCaptured - A boolean indicating whether payment has been captured
   * @property {Bool} hasRefundingEnabled - A boolean indicating whether payment supports refunds
   * @property {Bool} paymentApproved - A boolean indicating whether payment has been approved
   * @property {Bool} paymentPendingApproval - A boolean indicating whether payment is yet to be approved
   * @property {Bool} showAfterPaymentCaptured - A boolean indicating that status of the order is completed
   * @property {Bool} isCapturing - A boolean indicating whether payment is being captured
   * @property {Bool} isRefunding - A boolean indicating whether payment is being refunded
   * @return {Node} React node containing component for displaying the `invoice` section on the orders sideview
   */
  static propTypes = {
    adjustedTotal: PropTypes.number,
    currency: PropTypes.object,
    handleApprove: PropTypes.func,
    handleCapturePayment: PropTypes.func,
    handleRefund: PropTypes.func,
    hasRefundingEnabled: PropTypes.bool,
    invoice: PropTypes.object,
    isCapturing: PropTypes.bool,
    isRefunding: PropTypes.bool,
    paymentApproved: PropTypes.bool,
    paymentCaptured: PropTypes.bool,
    paymentPendingApproval: PropTypes.bool,
    printOrder: PropTypes.string,
    showAfterPaymentCaptured: PropTypes.bool
  }

  state = {
    value: 0
  }

  renderCapturedTotal() {
    const { invoice } = this.props;

    return (
      <div className="invoice-summary">
        <span className="invoice-label captured-total">
          <strong><Components.Translation defaultValue="Captured Total" i18nKey="admin.invoice.capturedTotal"/></strong>
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
          <strong><Components.Translation defaultValue="Adjusted Total" i18nKey="admin.invoice.adjustedTotal"/></strong>
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
      <div>
        {this.props.hasRefundingEnabled &&
          <div className="flex refund-container">
            <div className="refund-input">
              <Components.NumericInput
                numericType="currency"
                value={this.state.value}
                maxValue={adjustedTotal}
                format={this.props.currency}
                classNames={{
                  input: {
                    amount: true
                  }
                }}
                onChange={(event, data) => {
                  this.setState({
                    value: data.numberValue
                  });
                }}
              />
            </div>

            <Components.Button
              className="flex-item-fill refund-button"
              type="button"
              status="primary"
              bezelStyle="solid"
              disabled={this.props.isRefunding || this.state.value === 0}
              onClick={(event) => {
                this.props.handleRefund(event, this.state.value);
                this.setState({
                  value: 0
                });
              }}
            >
              {this.props.isRefunding ?
                <span id="btn-refund-payment" data-i18n="order.applyRefund">Refunding <i className="fa fa-spinner fa-spin" /></span> :
                <span id="btn-refund-payment" data-i18n="order.applyRefund">Apply Refund</span>
              }
            </Components.Button>
          </div>
        }

        {this.props.showAfterPaymentCaptured &&
          <div className="cancel-order-btn">
            <Components.Button
              className="btn btn-danger"
              bezelStyle="solid"
              label="Cancel Order"
              i18nKeyLabel="order.cancelOrderLabel"
              type="button"
              data-event-action="cancelOrder"
              style={{ marginBottom: 10 }}
              data-i18n="order.cancelOrderLabel"
            />
          </div>
        }

        <a
          className="btn btn-default btn-block"
          href={this.props.printOrder}
          target="_blank"
          data-i18n="app.printInvoice"
        >
          Print Invoice
        </a>
      </div>
    );
  }

  renderApproval() {
    if (this.props.paymentPendingApproval) {
      return (
        <div className="btn-block">
          <div>
            <Components.ButtonSelect
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
      );
    }

    if (this.props.paymentApproved) {
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
            onClick = {this.props.handleCapturePayment}
          >

            {this.props.isCapturing ?
              <span id="btn-capture-payment">
                Capturing <i className="fa fa-spinner fa-spin" id="btn-processing" />
              </span> :
              <span id="btn-capture-payment" data-i18n="order.capturePayment">Capture Payment</span>
            }
          </button>
        </div>
      );
    }
  }

  render() {
    return (
      <form onSubmit={this.props.handleApprove}>

        <div style={{ marginBottom: 15, marginTop: 15 }}>
          {this.renderApproval()}
          {this.props.paymentCaptured &&
            <div className="total-container">
              {this.renderCapturedTotal()}
              {this.props.invoice.total !== this.props.adjustedTotal && this.renderAdjustedTotal()}
              {this.renderRefundForm()}
            </div>
          }
        </div>
      </form>

    );
  }
}

registerComponent("InvoiceActions", InvoiceActions);

export default InvoiceActions;
