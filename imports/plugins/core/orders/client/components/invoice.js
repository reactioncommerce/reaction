import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";
import { Components, registerComponent, withMoment } from "@reactioncommerce/reaction-components";
import LineItems from "./lineItems";
import InvoiceActions from "./invoiceActions";

/**
 * @file Invoice is a React Component for displaying the `invoice` section on the orders sideview
 * @module Invoice
 * @extends Components
 */

class Invoice extends Component {
  /**
    * @name Invoice propTypes
    * @type {propTypes}
    * @param {Object} props - React PropTypes
    * @property {Object} invoice - An object representing an invoice
    * @property {Object} order - An object representing an order
    * @property {Bool} discounts - A boolean indicating whether discounts are enabled
    * @property {Array} refunds - An array/list of refunds
    * @property {Bool} paymentCaptured - A boolean indicating whether payment has been captured
    * @property {Bool} canMakeAdjustments - A boolean indicating whether adjustments could be made on total payment
    * @property {Bool} hasRefundingEnabled - A boolean indicating whether payment supports refunds
    * @property {Bool} isFetching - A boolean indicating whether refund list is being loaded
    * @return {Node} React node containing component for displaying the `invoice` section on the orders sideview
    */
  static propTypes = {
    canMakeAdjustments: PropTypes.bool,
    discounts: PropTypes.bool,
    displayMedia: PropTypes.func,
    hasRefundingEnabled: PropTypes.bool,
    invoice: PropTypes.object,
    isFetching: PropTypes.bool,
    moment: PropTypes.func,
    order: PropTypes.object,
    paymentCaptured: PropTypes.bool,
    refunds: PropTypes.array
  }

  state = {
    isOpen: false
  }

  /**
    * @name formatDate()
    * @method
    * @summary Formats dates
    * @param {Number} context - the date to be formatted
    * @param {String} block - the preferred format
    * @returns {String} formatted date
    */
  formatDate(context, block) {
    const { moment } = this.props;
    const dateFormat = block || "MMM DD, YYYY hh:mm:ss A";
    return (moment && moment(context).format(dateFormat)) || context.toLocaleString();
  }

  /**
    * @name handleClick()
    * @method
    * @summary Handle clicking the add discount link
    * @param {Event} event - the event that fired
    * @returns {null} null
    */
  handleClick = (event) => {
    event.preventDefault();
    this.setState({
      isOpen: true
    });
  }

  /**
    * @name renderDiscountForm()
    * @method
    * @summary Displays the discount form
    * @returns {null} null
    */
  renderDiscountForm() {
    return (
      <div>
        {this.state.isOpen &&
          <div>
            <hr/>
            <Components.DiscountList
              id={this.props.order._id}
              collection="Orders"
              validatedInput={true}
            />
            <hr/>
          </div>
        }
      </div>
    );
  }

  /**
    * @name renderRefundsInfo()
    * @method
    * @summary Displays the refund information after the order payment breakdown on the invoice
    * @returns {null} null
    */
  renderRefundsInfo() {
    const { hasRefundingEnabled, isFetching, refunds } = this.props;
    return (
      <div>
        {(hasRefundingEnabled && isFetching) &&
          <div className="form-group order-summary-form-group">
            <strong>Loading Refunds</strong>
            <div className="invoice-details">
              <i className="fa fa-spinner fa-spin" />
            </div>
          </div>
        }

        {Array.isArray(refunds) && refunds.map((refund) => (
          <div className="order-summary-form-group text-danger" key={refund.created} style={{ marginBottom: 15 }}>
            <strong>Refunded on: {this.formatDate(refund.created, "MM/D/YYYY")}</strong>
            <div className="invoice-details"><strong>{formatPriceString(refund.amount)}</strong></div>
          </div>
        ))}
      </div>
    );
  }

  /**
    * @name renderTotal()
    * @method
    * @summary Displays the total payment form
    * @returns {null} null
    */
  renderTotal() {
    return (
      <div className="order-summary-form-group">
        <hr/>
        <strong>TOTAL</strong>
        <div className="invoice-details">
          <strong>{formatPriceString(this.props.invoice.total)}</strong>
        </div>
      </div>
    );
  }

  /**
    * @name renderConditionalDisplay()
    * @method
    * @summary Displays either refunds info or the total payment form
    * @returns {null} null
    */
  renderConditionalDisplay() {
    const { canMakeAdjustments, paymentCaptured } = this.props;
    return (
      <div>
        {canMakeAdjustments ?
          <div> {this.renderTotal()} </div> :
          <span>
            {paymentCaptured ?
              <div>
                {this.renderRefundsInfo()}
              </div>
              :
              <div> {this.renderTotal()} </div>
            }
          </span>
        }
      </div>
    );
  }

  /**
    * @name renderInvoice()
    * @method
    * @summary Displays the invoice form with broken down payment info
    * @returns {null} null
    */
  renderInvoice() {
    const { invoice, discounts } = this.props;

    return (
      <div>
        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Items in order" i18nKey="cartSubTotals.orderItems" /></strong>
          <div className="invoice-details">
            {invoice.totalItems}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.subtotal)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.shipping)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.taxes)}
          </div>
        </div>

        {discounts &&
          <div>
            <div className="order-summary-form-group">
              <strong><Components.Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
              <div className="invoice-details">
                {formatPriceString(invoice.discounts)}
              </div>
            </div>
            {this.renderDiscountForm()}
          </div>
        }
        {this.renderConditionalDisplay()}
      </div>
    );
  }

  render() {
    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={false}
            i18nKeyTitle="admin.orderWorkflow.invoice.cardTitle"
            title="Invoice"
          />
          <Components.CardBody expandable={false}>
            <LineItems {...this.props} />

            <div className="invoice-container">
              {this.renderInvoice()}
            </div>

            <InvoiceActions {...this.props}/>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

registerComponent("Invoice", Invoice, withMoment);

export default withMoment(Invoice);
