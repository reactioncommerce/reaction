import { Template } from "meteor/templating";
import OrderDashboardContainer from "../containers/orderDashboardContainer";

Template.orders.helpers({
  ordersComponent() {
    return {
      component: OrderDashboardContainer
    };
  }
});
