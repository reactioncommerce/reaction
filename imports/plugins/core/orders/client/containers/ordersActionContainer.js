import React from "react";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import OrderActions from "../components/orderActions";
import * as Constants from "../../lib/constants";

const OrderHelper =  {
  makeQuery(filter) {
    let query = {};

    switch (filter) {
      // New orders
      case "new":
        query = {
          "workflow.status": "new"
        };
        break;

      // Orders that have yet to be captured & shipped
      case "processing":
        query = {
          "workflow.status": "coreOrderWorkflow/processing"
        };
        break;

      // Orders that have been shipped, based on if the items have been shipped
      case "shipped":
        query = {
          "items.workflow.status": "coreOrderItemWorkflow/shipped"
        };
        break;

      // Orders that are complete, including all items with complete status
      case "completed":
        query = {
          "workflow.status": "coreOrderWorkflow/completed",
          "items.workflow.workflow": {
            $in: ["coreOrderItemWorkflow/completed"]
          }
        };
        break;

      // Orders that have been captured, but not yet shipped
      case "captured":
        query = {
          "billing.paymentMethod.status": "completed",
          "shipping.shipped": false
        };
        break;

      case "canceled":
        query = {
          "workflow.status": "canceled"
        };
        break;

      // Orders that have been refunded partially or fully
      case "refunded":
        query = {
          "billing.paymentMethod.status": "captured",
          "shipping.shipped": true
        };
        break;
      default:
    }

    return query;
  }
};

function handleActionClick(filter) {
  Reaction.pushActionView({
    provides: "dashboard",
    template: "orders",
    data: {
      filter
    }
  });
}

function composer(props, onData) {
  Meteor.subscribe("Orders");

  const selectedFilterName = Reaction.getUserPreferences(Constants.PACKAGE_NAME, Constants.ORDER_LIST_FILTERS_PREFERENCE_NAME);
  const orders = Orders.find({}).fetch();
  let selectedIndex;

  const filters = Constants.orderFilters.map((filter, index) => {
    if (filter.name === selectedFilterName) {
      selectedIndex = index;
    }

    filter.label = i18next.t(`order.filter.${filter.name}`, { defaultValue: filter.label });
    filter.i18nKeyLabel = `order.filter.${filter.name}`;
    filter.count = Orders.find(OrderHelper.makeQuery(filter.name)).count();

    return filter;
  });

  onData(null, {
    orders,
    filters,
    selectedIndex,

    onActionClick: props.onActionClick || handleActionClick
  });
}

function OrdersActionContainer(props) {
  return (
    <OrderActions {...props} />
  );
}

export default composeWithTracker(composer, null)(OrdersActionContainer);
