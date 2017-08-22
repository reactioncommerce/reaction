import { Template } from "meteor/templating";
import OrdersListContainer from "../containers/ordersListContainer";

Template.orders.helpers({
  ordersComponent() {
    return {
      component: OrdersListContainer
    };
  }
});
