import { ExampleCheckoutFormContainer } from "../containers";
import { ExampleSettingsFormContainer } from "../containers";
// import { ExampleSettingsForm } from "../components";
import { Template } from "meteor/templating";

Template.examplePaymentForm.helpers({
  ExamplePayment() {
    return {
      component: ExampleCheckoutFormContainer
    };
  }
});

Template.exampleSettings.helpers({
  ExampleSettings() {
    return {
      component: ExampleSettingsFormContainer
    };
  }
});
