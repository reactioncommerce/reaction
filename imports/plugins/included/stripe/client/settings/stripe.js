import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { StripePackageConfig } from "../../lib/collections/schemas";

import "./stripe.html";

Template.stripeSettings.helpers({
  StripePackageConfig() {
    return StripePackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-stripe",
      shopId: Reaction.getShopId()
    });
  }
});

Template.stripe.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-stripe",
      shopId: Reaction.getShopId()
    });
  }
});

Template.stripe.events({
  "click [data-event-action=showStripeSettings]"() {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "stripe-update-form": {
    /* eslint-disable no-unused-vars*/
    onSuccess(operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Stripe settings saved.", "success");
    },
    onError(operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Stripe settings update failed. " + error, "danger");
    }
    /* eslint-enable no-unused-vars*/
  }
});
