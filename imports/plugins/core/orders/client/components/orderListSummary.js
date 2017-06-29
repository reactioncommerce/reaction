import React, { Component, PropTypes } from "react";
import { Currency, Translation } from "/imports/plugins/core/ui/client/components/";

class orderListSummary extends Component {
  static propTypes = {
    billings: PropTypes.arrayOf(Object),
    itemQty: PropTypes.number
  }
  handleTax(billing) {
    const { taxes } = billing.invoice;
    if (taxes > 0) {
      return (
        <div className="row">
          <div className="col-xs-7 order-totals-text">
            <span><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax" /></span>
          </div>
          <div className="order-price">
            <Currency amount={taxes} />
          </div>
        </div>
      );
    }
  }
  handleShipping(billing) {
    const { shipping } = billing.invoice;
    if (shipping > 0) {
      return (
        <div className="row">
          <div className="col-xs-7 order-totals-text">
            <span><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping" /></span>
          </div>
          <div className="order-price">
            <Currency amount={shipping} />
          </div>
        </div>
      );
    }
  }
  handleDiscounts(billing) {
    const { discounts } = billing.invoice;
    if (discounts > 0) {
      return (
        <div className="row">
          <div className="col-xs-7 order-totals-text">
            <span><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount" /></span>
          </div>
          <div className="order-price">
            <Currency amount={discounts} />
          </div>
        </div>
      );
    }
  }
  render() {
    return (
        <div className="order-totals-summary">
          <div className="row">
            {this.props.billings.map(billing => {
              const { total, subtotal } = billing.invoice;
              return (
                <div className="cart-items" key={billing._id}>
                  <div className="cart-totals">
                    <div className="row">
                      <div className="col-xs-7 order-totals-text">
                        <span><Translation defaultValue="Quantity" i18nKey="cartSubTotals.quantity" /></span>
                      </div>
                      <div className="order-price">
                        {this.props.itemQty}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-7 order-totals-text">
                        <span><Translation defaultValue="Sub Total" i18nKey="cartSubTotals.subtotal" /></span>
                      </div>
                      <div className="order-price">
                        <Currency amount={subtotal} />
                      </div>
                    </div>
                    {this.handleTax(billing)}
                    {this.handleShipping(billing)}
                    {this.handleDiscounts(billing)}
                    <hr />
                    <div className="row">
                      <div className="col-xs-7 order-totals-text">
                        <span style={{ textTransform: "uppercase" }}><Translation defaultValue="Captured Total" i18nKey="cartSubTotals.capturedTotal" /></span>
                      </div>
                      <div className="order-price">
                        <Currency amount={total} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    );
  }
}

export default orderListSummary;
