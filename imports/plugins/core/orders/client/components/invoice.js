import React, { Component, PropTypes } from "react";
import { formatPriceString } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";
import DiscountList from "/imports/plugins/core/discounts/client/components/list";

class Invoice extends Component {
  static propTypes = {
    canMakeAdjustments: PropTypes.bool,
    collection: PropTypes.string,
    dateFormat: PropTypes.func,
    discounts: PropTypes.bool,
    handleClick: PropTypes.func,
    invoice: PropTypes.object,
    isFetching: PropTypes.bool,
    isOpen: PropTypes.bool,
    orderId: PropTypes.string,
    paymentCaptured: PropTypes.bool,
    refunds: PropTypes.array
  }

  renderDiscountForm() {
    const { isOpen, orderId, collection } = this.props;

    return (
      <div>
        {isOpen &&
          <div>
            <hr/>
              <DiscountList
                id={orderId}
                collection={collection}
                validatedInput={true}
              />
            <hr/>
          </div>
        }
      </div>
    );
  }

  renderRefundsInfo() {
    const { isFetching, refunds, dateFormat } = this.props;

    return (
      <div>
        {isFetching &&
          <div className="form-group order-summary-form-group">
            <strong>Loading Refunds</strong>
            <div className="invoice-details">
              <i className="fa fa-spinner fa-spin" />
            </div>
          </div>
        }

        {refunds && refunds.map((refund) => (
          <div className="order-summary-form-group text-danger" key={refund.created} style={{ marginBottom: 15 }}>
            <strong>Refunded on: {dateFormat(refund.created, "MM/D/YYYY")}</strong>
            <div className="invoice-details"><strong>{formatPriceString(refund.amount)}</strong></div>
          </div>
        ))}
      </div>
    );
  }

  renderTotal() {
    const { invoice } = this.props;

    return (
      <div className="order-summary-form-group">
        <hr/>
        <strong>TOTAL</strong>
        <div className="invoice-details">
          <strong>{formatPriceString(invoice.total)}</strong>
        </div>
      </div>
    );
  }

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

  render() {
    const { invoice, discounts, handleClick } = this.props;

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

        {discounts &&
          <div>
            <div className="order-summary-form-group">
              <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
              <div className="invoice-details">
                <i className="fa fa-tag fa-lg" style={{ marginRight: 2 }}/>
                <a className="btn-link" onClick={handleClick}>Add Discount</a>
              </div>
            </div>
            {this.renderDiscountForm()}
          </div>
        }
        {this.renderConditionalDisplay()}
      </div>
    );
  }
}

export default Invoice;
