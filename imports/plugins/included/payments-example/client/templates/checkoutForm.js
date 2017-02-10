import { CheckoutForm } from "../components";
import { Template } from "meteor/templating";

Template.examplePaymentForm.helpers({
  ExamplePayment() {
    return {
      component: CheckoutForm
    };
  }
});
