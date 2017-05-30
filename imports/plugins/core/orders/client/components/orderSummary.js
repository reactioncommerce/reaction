import React, { Component, PropTypes } from "react";
import moment from "moment";
import { ClickToCopy } from "/imports/plugins/core/ui/client/components";
import { Badge } from "/imports/plugins/core/ui/client/components";

class OrderSummary extends Component {
  static propTypes = {
    dateFormat: PropTypes.func,
    order: PropTypes.object,
    printableLabels: PropTypes.func,
    profileShippingAddress: PropTypes.object,
    shipmentStatus: PropTypes.func,
    tracking: PropTypes.func
  }

  orderLink() {
    const orderId = this.props.order._id;
    return orderId;
  }

  badgeStatus() {
    const orderStatus = this.props.order.workflow.status;

    if (orderStatus === "new") {
      return "info";
    } else if (orderStatus === "coreOrderWorkflow/processing") {
      return "success";
    } else if (orderStatus === "coreOrderWorkflow/canceled") {
      return "danger";
    } else if (orderStatus === "coreOrderWorkflow/completed") {
      return "primary";
    }

    return "default";
  }

  truncateId() {
    const orderId = this.props.order._id;
    const shortId = orderId.slice(-5);

    return shortId;
  }

  render() {
    const { dateFormat, tracking, order, profileShippingAddress, printableLabels } = this.props;

    return (
      <div>
        <div className="order-summary-form-group bg-info" style={{ lineHeight: 3, marginTop: -15, marginRight: -15, marginLeft: -15 }}>
          <strong style={{ marginLeft: 15 }}>{profileShippingAddress.fullName} </strong>&nbsp;{profileShippingAddress.city}, {profileShippingAddress.region}
          <div className="invoice-details" style={{ marginRight: 15, position: "relative", cursor: "pointer" }}>
            <strong>ID </strong>
            <ClickToCopy
              copyToClipboard={this.orderLink()}
              displayText={this.truncateId()}
              i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
              tooltip="Copy Order Link"
            />
          </div>
        </div>

        <div className="roll-up-invoice-list">
          <div className="roll-up-content">
            <div style={{ marginBottom: 4 }}>
              <Badge
                badgeSize="large"
                i18nKeyLabel={`cartDrawer.${order.workflow.status}`}
                label={order.workflow.status}
                status={this.badgeStatus()}
              />
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.created">Created</strong>
              <div className="invoice-details">
                {moment(order.createdAt).fromNow()} | {dateFormat(order.createdAt, "MM/D/YYYY")}
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
