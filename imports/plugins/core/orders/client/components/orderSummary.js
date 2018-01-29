import React, { Component } from "react";
import PropTypes from "prop-types";
import { withMoment } from "@reactioncommerce/reaction-components";
import { Badge, ClickToCopy } from "@reactioncommerce/reaction-ui";
import { getOrderRiskBadge, getOrderRiskStatus, getBillingInfo, getShippingInfo } from "../helpers";

class OrderSummary extends Component {
  static propTypes = {
    dateFormat: PropTypes.func,
    moment: PropTypes.func,
    order: PropTypes.object,
    printableLabels: PropTypes.func,
    profileShippingAddress: PropTypes.object,
    shipmentStatus: PropTypes.func,
    tracking: PropTypes.func
  }

  badgeStatus() {
    const { order } = this.props;
    const orderStatus = order && order.workflow && order.workflow.status;

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

  orderLink() {
    const orderId = this.props.order._id;
    return orderId;
  }

  truncateId() {
    const orderId = this.props.order._id;
    const shortId = orderId.slice(-5);

    return shortId;
  }

  render() {
    const { dateFormat, moment, order, profileShippingAddress, printableLabels, tracking } = this.props;
    const paymentMethod = getBillingInfo(order).paymentMethod || {};
    const invoice = getBillingInfo(order).invoice || {};
    const shipmentMethod = getShippingInfo(order).shipmentMethod || {};
    const orderRisk = getOrderRiskStatus(order);

    return (
      <div>
        <div
          className="order-summary-form-group bg-info"
          style={{ lineHeight: 3, marginTop: -15, marginRight: -15, marginLeft: -15 }}
        >
          <strong style={{ marginLeft: 15 }}>{profileShippingAddress && profileShippingAddress.fullName}</strong>
          <div className="invoice-details" style={{ marginRight: 15, position: "relative" }}>
            {order.email}
          </div>
        </div>

        <div className="roll-up-invoice-list">
          <div className="roll-up-content">
            <div style={{ marginBottom: 4 }}>
              <Badge
                badgeSize="large"
                i18nKeyLabel={`cartDrawer.${order && order.workflow && order.workflow.status}`}
                label={order && order.workflow && order.workflow.status}
                status={this.badgeStatus()}
              />
              {orderRisk &&
                <Badge
                  badgeSize="large"
                  className={`risk-info risk-info-detail ${orderRisk}`}
                  i18nKeyLabel={`admin.orderRisk.${orderRisk}`}
                  label={orderRisk}
                  status={getOrderRiskBadge(orderRisk)}
                />
              }
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.orderId">Order ID</strong>
              <div className="invoice-details" style={{ cursor: "pointer" }}>
                <ClickToCopy
                  copyToClipboard={this.orderLink()}
                  displayText={order._id}
                  i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
                  tooltip="Copy Order Link"
                />
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.created">Created</strong>
              <div className="invoice-details">
                {moment && moment(order.createdAt).fromNow()} | {dateFormat(order.createdAt, "MM/D/YYYY")}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.processor">Processor</strong>
              <div className="invoice-details">
                {paymentMethod && paymentMethod.processor}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.payment">Payment</strong>
              <div className="invoice-details">
                {paymentMethod.storedCard} ({invoice.total})
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="order.transaction">Transaction</strong>
              <div className="invoice-details">
                {paymentMethod.transactionId}
              </div>
            </div>

            <div className="order-summary-form-group">
              <strong data-i18n="orderShipping.carrier">Carrier</strong>
              <div className="invoice-details">
                {shipmentMethod.carrier} - {shipmentMethod.label}
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
          <br/>
          <span>{profileShippingAddress.address1}</span>
          {profileShippingAddress.address2 && <span><br/>{profileShippingAddress.address2}</span>}
          <br/>
          <span>
            {profileShippingAddress.city}, {profileShippingAddress.region}, {profileShippingAddress.country} {profileShippingAddress.postal}
          </span>
        </div>
      </div>
    );
  }
}

export default withMoment(OrderSummary);
