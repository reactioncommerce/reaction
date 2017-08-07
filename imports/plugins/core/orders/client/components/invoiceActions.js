import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";
import { Button, NumericInput, Translation, ButtonSelect } from "/imports/plugins/core/ui/client/components";

class InvoiceActions extends Component {
  static propTypes = {
    adjustedTotal: PropTypes.number,
    handleActionViewBack: PropTypes.func,
    invoice: PropTypes.object,
    isAdjusted: PropTypes.func
  }

  state = {
    value: 0
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
          <strong><Translation defaultValue="Adjusted Total" data-i18n="admin.invoice.adjustedTotal"/></strong>
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
      <div className="flex refund-container">
        <div className="form-group order-summary-form-group">
          <div className="invoice-details">
            <NumericInput
              numericType="currency"
              value={this.state.value}
              maxValue={adjustedTotal}
              format={this.props.currency}
              classNames={{
                input: {
                  amount: true
                }
              }}
              onChange={(event, data)=>{
                this.setState({
                  value: data.numberValue
                });
              }}
            />
          </div>

        </div>

        <Button
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
          <span id="btn-refund-payment" data-i18n="order.applyRefund">Apply Refund</span>
          {this.props.isRefunding && <i className="fa fa-spinner fa-spin" />}
        </Button>

        {this.props.showAfterPaymentCaptured &&
          <Button
            className="btn btn-danger"
            bezelStyle="solid"
            type="button"
            data-event-action="cancelOrder"
            style={{ marginBottom: 10 }}
            data-i18n="order.cancelOrderLabel"
          >
            Cancel Order
          </Button>
        }

        <a
          className="btn btn-default btn-block"
          href={this.props.printOrder()}
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
      );
    }

    if (this.props.paymentApproved) {
      return (
        <div className="flex">
          <a
            className="btn btn-link"
            href={this.props.printOrder()}
            target="_blank"
            data-i18n="app.print"
          >
            Print
          </a>

          <button
            className="btn btn-success flex-item-fill"
            type="button"
            data-event-action="capturePayment"
            disabled={this.props.capturedDisabled}
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
    const { isAdjusted } = this.props;

    return (
      <form onSubmit={this.props.handleApprove}>

        <div style={{ marginBottom: 15, marginTop: 15 }}>
          {this.renderApproval()}
          {this.props.paymentCaptured &&
            <div className="total-container">
              {this.renderCapturedTotal()}
              {isAdjusted() && this.renderAdjustedTotal()}
              {this.renderRefundForm()}
            </div>
          }
        </div>
      </form>

    );
  }
}

export default InvoiceActions;
