import { Template } from "meteor/templating";
import OrderSummaryContainer from "../../containers/orderSummaryContainer";

Template.coreOrderShippingSummary.helpers({
  orderSummary() {
    return {
      component: OrderSummaryContainer,
      ...Template.currentData()
    };
  }
});
