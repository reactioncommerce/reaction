import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { StripeScript } from "./lib/stripeScript";
import StripePaymentFormContainer from "./containers/stripePaymentFormContainer";

Template.stripePaymentForm.onCreated(function () {
  StripeScript.load();
  this.state = new ReactiveDict();
  this.state.setDefault({
    isLoading: true
  });
});

Template.stripePaymentForm.onRendered(function () {
  this.autorun(() => {
    if (StripeScript.loaded()) {
      this.state.set("isLoading", false);
    }
  });
});

Template.stripePaymentForm.helpers({
  StripePaymentFormComponent() {
    return {
      component: StripePaymentFormContainer
    };
  },

  isLoading() {
    return Template.instance().state.equals("isLoading", true);
  }
});
