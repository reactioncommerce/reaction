import React, { Component, PropTypes } from "react";
import { formatPriceString } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";
import DiscountList from "/imports/plugins/core/discounts/client/components/list";

class Invoice extends Component {
  constructor(props) {
    super(props);

    this.renderConditionalDisplay = this.renderConditionalDisplay.bind(this);
    this.renderDiscountForm = this.renderDiscountForm.bind(this);
    this.renderRefundsInfo = this.renderRefundsInfo.bind(this);
    this.renderTotal = this.renderTotal.bind(this);
  }

  renderDiscountForm() {
    return (
      <div>
        {this.props.isOpen &&
          <div>
            <hr/>
              <DiscountList
                id={this.props.orderId}
                collection={this.props.collection}
                validatedInput={true}
              />
            <hr/>
          </div>
        }
      </div>
    );
  }

  renderRefundsInfo() {
    return (
      <div>
        {this.props.isFetching &&
          <div className="form-group order-summary-form-group">
            <strong>Loading Refunds</strong>
            <div className="invoice-details">
              <i className="fa fa-spinner fa-spin" />
            </div>
          </div>
        }

        {this.props.refunds && this.props.refunds.map((refund) => (
          <div className="order-summary-form-group text-danger" key={refund.created} style={{ marginBottom: 15 }}>
            <strong>Refunded on: {this.props.dateFormat(refund.created, "MM/D/YYYY")}</strong>
            <div className="invoice-details"><strong>{formatPriceString(refund.amount)}</strong></div>
          </div>
        ))}
      </div>
    );
  }

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

  renderConditionalDisplay() {
    return (
      <div>
        {this.renderDiscountForm()}
        {this.props.canMakeAdjustments ?
          <div> {this.renderTotal()} </div> :
          <span>
            {this.props.paymentCaptured ?
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

  render() {
    const invoice = this.props.invoice;

    return (
      <div>
        <div className="order-summary-form-group">
          <strong>Quantity Total</strong>
          <div className="invoice-details">
            {invoice.totalItems}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.subtotal)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.shipping)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.taxes)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
          <div className="invoice-details">
            <i className="fa fa-tag fa-lg" style={{ marginRight: 2 }}/>
            <a className="btn-link" onClick={this.props.handleClick}>Add Discount</a>
          </div>
        </div>

        {this.renderConditionalDisplay()}
      </div>
    );
  }
}

Invoice.propTypes = {
  adjustedTotal: PropTypes.number,
  canMakeAdjustments: PropTypes.bool,
  collection: PropTypes.string,
  dateFormat: PropTypes.func,
  handleClick: PropTypes.func,
  invoice: PropTypes.object,
  isFetching: PropTypes.bool,
  isOpen: PropTypes.bool,
  orderId: PropTypes.string,
  paymentCaptured: PropTypes.bool,
  refunds: PropTypes.array
};

export default Invoice;

