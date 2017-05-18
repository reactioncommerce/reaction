import React, { Component, PropTypes } from "react";
import moment from "moment";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Orders } from "/lib/collections";
import { i18next } from "/client/api";
import OrderSummary from "../components/orderSummary";

class OrderSummaryContainer extends Component {
  static propTypes = {
    order: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.dateFormat = this.dateFormat.bind(this);
    this.tracking = this.tracking.bind(this);
    this.shipmentStatus = this.shipmentStatus.bind(this);
  }

  dateFormat = (context, block) => {
    const f = block || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }

  tracking = () => {
    if (this.props.order.shipping[0].tracking) {
      return this.props.order.shipping[0].tracking;
    }
    return i18next.t("orderShipping.noTracking");
  }

  shipmentStatus = () => {
    const order = this.props.order;
    const shipment = order.shipping[0];

    if (shipment.delivered) {
      return {
        delivered: true,
        shipped: true,
        status: "success",
        label: i18next.t("orderShipping.delivered")
      };
    }

    const shipped = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            if (_.isArray(fullItem.workflow.workflow)) {
              return _.includes(fullItem.workflow.workflow, "coreOrderItemWorkflow/completed");
            }
          }
        }
      }
    });

    const canceled = _.every(shipment.items, (shipmentItem) => {
      for (const fullItem of order.items) {
        if (fullItem._id === shipmentItem._id) {
          if (fullItem.workflow) {
            return fullItem.workflow.status === "coreOrderItemWorkflow/canceled";
          }
        }
      }
    });

    if (shipped) {
      return {
        delivered: false,
        shipped: true,
        status: "success",
        label: i18next.t("orderShipping.shipped")
      };
    }

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
    const { shippingLabelUrl, customsLabelUrl } = this.props.order.shipping[0];
    if (shippingLabelUrl || customsLabelUrl) {
      return { shippingLabelUrl, customsLabelUrl };
    }

    return false;
  }

  render() {
    return (
      <div>
        <OrderSummary
          {...this.props}
          dateFormat={this.dateFormat}
          tracking={this.tracking}
          shipmentStatus={this.shipmentStatus}
          printableLabels={this.printableLabels}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  const orderSub = Meteor.subscribe("Orders");

  if (orderSub.ready()) {
    // Find current order
    const order = Orders.findOne({
      "_id": props.orderId,
      "shipping._id": props.fulfillment._id
    });

    const profileShippingAddress = order.shipping[0].address;

    if (order.workflow) {
      if (order.workflow.status === "coreOrderCreated") {
        order.workflow.status = "coreOrderCreated";
        Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", order);
      }
    }

    onData(null, {
      order: order,
      profileShippingAddress: profileShippingAddress
    });
  }
};

export default composeWithTracker(composer, null)(OrderSummaryContainer);
