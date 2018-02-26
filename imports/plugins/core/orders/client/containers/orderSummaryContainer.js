import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
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
    const f = block || "MMM DD, YYYY hh:mm:ss A";
    return (moment && moment(context).format(f)) || context.toLocaleString();
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
  const orderSub = Meteor.subscribe("Orders");

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
