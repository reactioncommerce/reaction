import { ExampleCheckoutFormContainer } from "../containers";
import { Template } from "meteor/templating";

Template.examplePaymentForm.helpers({
  ExamplePayment() {
    return {
      component: ExampleCheckoutFormContainer
    };
  }
});
