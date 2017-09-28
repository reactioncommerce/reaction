import { Template } from "meteor/templating";
import OrderDashboardContainer from "../containers/blah";

Template.orders.helpers({
  ordersComponent() {
    return {
      component: OrderDashboardContainer
    };
  }
});
