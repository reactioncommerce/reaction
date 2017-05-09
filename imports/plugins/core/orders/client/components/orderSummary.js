import React, { Component, PropTypes } from "react";

class OrderSummary extends Component {
  static propTypes = {
    dateFormat: PropTypes.func,
    order: PropTypes.object,
    printableLabels: PropTypes.func,
    profileShippingAddress: PropTypes.object,
    shipmentStatus: PropTypes.func,
    tracking: PropTypes.func
  }

  render() {
    const { dateFormat, tracking, order, shipmentStatus, profileShippingAddress, printableLabels } = this.props;

    return (
      <div>
        <div className="order-summary-form-group bg-info" style={{ lineHeight: 3, marginTop: -15, marginRight: -15, marginLeft: -15 }}>
          <strong style={{ marginLeft: 15 }}>{profileShippingAddress.fullName}</strong> , {profileShippingAddress.country}
          <div className="invoice-details" style={{ marginRight: 15 }}>
            <strong>ID </strong>{order._id}
          </div>
        </div>

        <div className="roll-up-invoice-list">
          <div className="roll-up-content">
            <div style={{ marginBottom: 4 }}>
              <span className={`badge badge-${shipmentStatus().status}`}>{shipmentStatus().label}</span>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.created">Created</strong>
              <div className="invoice-details">
                {dateFormat(order.createdAt, "MM/D/YYYY")}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.processor">Processor</strong>
              <div className="invoice-details">
                {order.billing[0].paymentMethod.processor}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.payment">Payment</strong>
              <div className="invoice-details">
                {order.billing[0].paymentMethod.storedCard} ({order.billing[0].invoice.total})
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.transaction">Transaction</strong>
              <div className="invoice-details">
                {order.billing[0].paymentMethod.transactionId}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="orderShipping.carrier">Carrier</strong>
              <div className="invoice-details">
                {order.shipping[0].shipmentMethod.carrier} - {order.shipping[0].shipmentMethod.label}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="orderShipping.tracking">Tracking</strong>
              <div className="invoice-details">
                {tracking()}
              </div>
            </div>

            {printableLabels() &&
              <div className="order-summary-form-group">
                <strong data-i18n="orderShipping.printLabels">Labels</strong>
                {printableLabels().shippingLabelUrl ?
                  <a className="invoice-details" href={printableLabels().shippingLabelUrl} target="_blank">
                    <span data-i18n="orderShipping.printShippingLabel">Print Shipping</span>
                  </a> :
                  <a className="invoice-details" href={printableLabels().customsLabelUrl} target="_blank">
                    <span data-i18n="orderShipping.printCustomsLabel">Print Customs</span>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <br/>
        <div className="order-summary-form-group">
          <strong data-i18n="orderShipping.shipTo">Ship to</strong>
          <div className="invoice-details">
            <strong>Phone: </strong>{profileShippingAddress.phone}
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <span>{profileShippingAddress.fullName}</span>
          <br/><span>{profileShippingAddress.address1}</span>
          {profileShippingAddress.address2 && <span><br/>{profileShippingAddress.address2}</span>}
          <br/><span>{profileShippingAddress.city}, {profileShippingAddress.region}, {profileShippingAddress.country} {profileShippingAddress.postal}</span>
        </div>
      </div>
    );
  }
}

export default OrderSummary;
