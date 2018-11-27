import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, withMoment } from "@reactioncommerce/reaction-components";
import { Orders } from "/lib/collections";
import { Card, CardHeader, CardBody, CardGroup } from "/imports/plugins/core/ui/client/components";
import { i18next } from "/client/api";
import OrderSummary from "../components/orderSummary";
import { getShippingInfo } from "../helpers";

class OrderSummaryContainer extends Component {
  static propTypes = {
    moment: PropTypes.func,
    order: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.dateFormat = this.dateFormat.bind(this);
    this.tracking = this.tracking.bind(this);
    this.shipmentStatus = this.shipmentStatus.bind(this);
  }

  dateFormat = (context, block) => {
    const { moment } = this.props;
    const formatString = block || "MMM DD, YYYY hh:mm:ss A";
    return (moment && moment(context).format(formatString)) || context.toLocaleString();
  }

  tracking = () => {
    const shipping = getShippingInfo(this.props.order);
    if (shipping.tracking) {
      return shipping.tracking;
    }
    return i18next.t("orderShipping.noTracking");
  }

  shipmentStatus = () => {
    const { order } = this.props;
    const shipment = getShippingInfo(this.props.order);

    if (shipment.delivered) {
      return {
        delivered: true,
        shipped: true,
        status: "success",
        label: i18next.t("orderShipping.delivered")
      };
    }

    const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
    const shipped = orderItems.every((item) => {
      if (shipment.itemIds.indexOf(item._id) === -1) {
        // The item is not in this shipment so we don't care
        return true;
      }

      return item.workflow && Array.isArray(item.workflow.workflow) &&
        item.workflow.workflow.indexOf("coreOrderItemWorkflow/shipped") > -1;
    });

    if (shipped) {
      return {
        delivered: false,
        shipped: true,
        status: "success",
        label: i18next.t("orderShipping.shipped")
      };
    }

    const canceled = orderItems.every((item) => {
      if (shipment.itemIds.indexOf(item._id) === -1) {
        // The item is not in this shipment so we don't care
        return true;
      }

      return item.workflow && item.workflow.status === "coreOrderItemWorkflow/canceled";
    });

    if (canceled) {
      return {
        delivered: false,
        shipped: false,
        status: "danger",
        label: i18next.t("order.canceledLabel")
      };
    }

    return {
      delivered: false,
      shipped: false,
      status: "info",
      label: i18next.t("orderShipping.notShipped")
    };
  }

  printableLabels = () => {
    const { shippingLabelUrl, customsLabelUrl } = getShippingInfo(this.props.order);
    if (shippingLabelUrl || customsLabelUrl) {
      return { shippingLabelUrl, customsLabelUrl };
    }

    return false;
  }

  render() {
    return (
      <CardGroup>
        <Card>
          <CardHeader
            actAsExpander={false}
            i18nKeyTitle="admin.orderWorkflow.summary.cardTitle"
            title="Summary"
          />
          <CardBody expandable={false}>
            <OrderSummary
              {...this.props}
              dateFormat={this.dateFormat}
              tracking={this.tracking}
              shipmentStatus={this.shipmentStatus}
              printableLabels={this.printableLabels}
            />
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}

const composer = (props, onData) => {
  const query = { _id: props.orderId };
  const options = { limit: 1, skip: 0 };
  const orderSub = Meteor.subscribe("PaginatedOrders", query, options);

  if (orderSub.ready()) {
    // Find current order
    const order = Orders.findOne({
      "_id": props.orderId,
      "shipping._id": props.fulfillment && props.fulfillment._id
    });

    if (order) {
      const profileShippingAddress = getShippingInfo(order).address || {};

      if (order.workflow) {
        if (order.workflow.status === "coreOrderCreated") {
          order.workflow.status = "coreOrderCreated";
          Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", order);
        }
      }

      onData(null, {
        order,
        profileShippingAddress
      });
    } else {
      onData(null, {
        order: {},
        profileShippingAddress: {}
      });
    }
  }
};

export default composeWithTracker(composer)(withMoment(OrderSummaryContainer));
