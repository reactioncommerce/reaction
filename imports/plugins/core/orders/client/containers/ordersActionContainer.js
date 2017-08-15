import React from "react";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
// import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Reaction, i18next } from "/client/api";
import * as Constants from "../../lib/constants";
import OrderActions from "../components/orderActions";

// function handleActionClick(filter) {
//   Reaction.pushActionView({
//     provides: "dashboard",
//     template: "orders",
//     data: {
//       filter
//     }
//   });
// }

function composer(props, onData) {
  const selectedFilterName = Reaction.getUserPreferences(Constants.PACKAGE_NAME, Constants.ORDER_LIST_FILTERS_PREFERENCE_NAME);
  let selectedIndex;

  const filters = Constants.orderFilters.map((filter, index) => {
    if (filter.name === selectedFilterName) {
      selectedIndex = index;
    }

    filter.label = i18next.t(`order.filter.${filter.name}`, { defaultValue: filter.label });
    filter.i18nKeyLabel = `order.filter.${filter.name}`;

    return filter;
  });

  onData(null, {
    filters
  });
}

function OrdersActionContainer(props) {
  return (
    <OrderActions {...props}/>
  );
}

export default composeWithTracker(composer)(OrdersActionContainer);
