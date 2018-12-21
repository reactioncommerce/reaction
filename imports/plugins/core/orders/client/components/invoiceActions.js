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
  static propTypes = {
    /**
     * The calculated adjusted total after refunds/discounts
     */
    adjustedTotal: PropTypes.number,
    /**
     * Currency details for the current shop
     */
    currency: PropTypes.object,
    /**
     * A function for approving payments
     */
    handleApprove: PropTypes.func,
    /**
     * A function for capturing payments
     */
    handleCapturePayment: PropTypes.func,
    /**
     * A function for refunding payments
     */
    handleRefund: PropTypes.func,
    /**
     * hasRefundingEnabled
     */
    hasRefundingEnabled: PropTypes.bool,
    /**
     * The invoice document
     */
    invoice: PropTypes.object,
    /**
     * True while the payment is being captured
     */
    isCapturing: PropTypes.bool,
    /**
     * True while a refund is being created
     */
    isRefunding: PropTypes.bool,
    /**
     * List of payments for this invoice
     */
    payments: PropTypes.arrayOf(PropTypes.shape({
      mode: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired
    })),
    /**
     * A string representing the route/path for printed order
     */
    printOrder: PropTypes.string
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
    const { adjustedTotal, payments } = this.props;
    const [payment] = payments;

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
                onChange={(event, value) => {
                  this.setState({
                    value
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

        {payment.status === "completed" &&
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
    const { payments } = this.props;
    const [payment] = payments;

    switch (payment.status) {
      case "adjustments":
      case "created":
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

      case "approved":
      case "error":
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
                  Capturing <i className="fa fa-spinner fa-spin" id="btn-processing" />
                </span> :
                <span id="btn-capture-payment" data-i18n="order.capturePayment">Capture Payment</span>
              }
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  render() {
    const { adjustedTotal, handleApprove, invoice, payments } = this.props;
    const [payment] = payments;
    const { mode } = payment;

    return (
      <form onSubmit={handleApprove}>
        <div style={{ marginBottom: 15, marginTop: 15 }}>
          {this.renderApproval()}
          {mode === "captured" &&
            <div className="total-container">
              {this.renderCapturedTotal()}
              {invoice.total !== adjustedTotal && this.renderAdjustedTotal()}
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
