import React from "react";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import OrderActions from "../components/orderActions";
import * as Constants from "../../lib/constants";

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
  const selectedFilterName = Reaction.getUserPreferences(Constants.PACKAGE_NAME, Constants.ORDER_LIST_FILTERS_PREFERENCE_NAME);
  let selectedIndex;

  Meteor.subscribe("PaginatedOrders", selectedFilterName, (props.limit || 0));

  const filters = Constants.orderFilters.map((filter, index) => {
    if (filter.name === selectedFilterName) {
      selectedIndex = index;
    }

    filter.label = i18next.t(`order.filter.${filter.name}`, { defaultValue: filter.label });
    filter.i18nKeyLabel = `order.filter.${filter.name}`;

    if (filter.name === "new") {
      filter.count = Counts.get("newOrder-count");
    } else if (filter.name === "processing") {
      filter.count = Counts.get("processingOrder-count");
    } else if (filter.name === "completed") {
      filter.count = Counts.get("completedOrder-count");
    }

    return filter;
  });

  onData(null, {
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
