import { Template } from "meteor/templating";
import OrdersContainer from "../containers/ordersContainer";

Template.orders.helpers({
  ordersComponent() {
    return {
      component: OrdersContainer
    };
  }
});
