import React, { Component, PropTypes } from "react";
import OrderListSummary from "./orderListSummary";
import OrderListItem from "../containers/orderListItemsContainer";

class OrderList extends Component {
  static propTypes = {
    itemQty: PropTypes.number,
    order: PropTypes.object,
    shopName: PropTypes.string
  }
  handleQty(order) {
    let itemQty = 0;
    order.items.forEach(item => {
      itemQty += item.quantity;
    });
    return itemQty;
  }
  render() {
    const { order, shopName } = this.props;
    const { shipping, billing } = order;
    if (order) {
      return (
        <div>
          <div style={{ float: "left", width: "50%", marginTop: "30px" }}>
            <span className="order-items-title">Your Items</span>
            <div className="order-vendor-container">
              <div className="col-xs-12">
                <strong>
                  <span id="order-group-name" className="order-vendor">{shopName}</span>
                </strong>
              </div>
            </div>
            <div className="order-list-items">
              <div className="col-xs-12">
                <OrderListItem
                  items={order.items}
                />
              </div>
            </div>
          </div>
          <div style={{ float: "left", width: "50%", padding: "30px" }}>
            <div className="row order-address-info">
              <div className="col-xs-6 col-sm-2">
                <strong>
                  <span data-i18n="order.destination" className="order-summary-title">Destination</span>
                </strong>
              </div>
              <div className="col-xs-10 order-summary-details">
                {shipping.map(shippingInfo => {
                  const { address } = shippingInfo;
                  return (
                    <span key={shippingInfo._id}>
                      <address>
                        {address.address1}
                        {address.address2}
                        {address.city}, {address.region} {address.postal} {address.country}
                        {address.phone}
                      </address>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="row order-payment-info">
              <div className="col-xs-6 col-sm-2">
                <strong>
                  <span data-i18n="order.payment" className="order-summary-title">Payment</span>
                </strong>
              </div>
              <div className="col-xs-10 order-summary-payment">
                {billing.map(billingInfo => {
                  return (
                    <div key={billingInfo._id}>
                      <span id="order-payment-method">{billingInfo.paymentMethod.storedCard}</span>
                      <span data-id="order.reference">Ref:</span>
                      <span id="order-payment-transaction">{billingInfo.paymentMethod.transactionId}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="order-totals-summary">
              <OrderListSummary
                billings={billing}
                itemQty={this.handleQty(order)}
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="alert alert-info">
        <span data-i18n="cartCompleted.noOrdersFound">No orders found.</span>
      </div>
    );
  }
}

export default OrderList;
