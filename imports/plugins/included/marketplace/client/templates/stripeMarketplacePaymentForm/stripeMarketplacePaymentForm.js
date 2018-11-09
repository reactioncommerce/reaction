import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { StripeScript } from "../../util/stripeScript";
import StripePaymentFormContainer from "../../containers/stripePaymentFormContainer";

import "./stripeMarketplacePaymentForm.html";
import "./stripeMarketplacePaymentForm.less";

Template.stripeMarketplacePaymentForm.onCreated(function () {
  StripeScript.load();
  this.state = new ReactiveDict();
  this.state.setDefault({
    isLoading: true
  });
});

Template.stripeMarketplacePaymentForm.onRendered(function () {
  this.autorun(() => {
    if (StripeScript.loaded()) {
      this.state.set("isLoading", false);
    }
  });
});

Template.stripeMarketplacePaymentForm.helpers({
  StripePaymentFormComponent() {
    return {
      component: StripePaymentFormContainer
    };
  },

  isLoading() {
    return Template.instance().state.equals("isLoading", true);
  }
});
