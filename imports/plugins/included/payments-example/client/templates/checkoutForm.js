import { ExampleCheckoutFormContainer } from "../containers";
import { ExampleSettingsForm } from "../components";
import { Template } from "meteor/templating";

import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { ExamplePackageConfig } from "../../lib/collections/schemas";

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
      component: ExampleSettingsForm
    };
  }
});
