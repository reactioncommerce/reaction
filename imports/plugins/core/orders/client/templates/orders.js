import { Template } from "meteor/templating";
// import { Reaction } from "/client/api";
import OrdersListContainer from "../containers/ordersListContainer";
// import {
//   PACKAGE_NAME,
//   ORDER_LIST_FILTERS_PREFERENCE_NAME,
//   ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME,
//   DEFAULT_FILTER_NAME,
//   orderFilters
// } from "../../lib/constants";

// Template.orders.onCreated(function () {

//   const status = Reaction.Router.getQueryParam("status");
//   console.log("status", status);
//   console.log("data", this.data);
//   console.log("data.filter", this.data.filter);
//   console.log("data.filter.name", this.data.filter.name);
//   const filterName = this.data && this.data.filter && this.data.filter.name || status;
//   Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, filterName);

// });

Template.orders.helpers({
  ordersComponent() {
    return {
      component: OrdersListContainer
    };
  }
});
