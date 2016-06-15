import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { StripePackageConfig } from "../../lib/collections/schemas";

Template.stripeSettings.helpers({
  StripePackageConfig: function () {
    return StripePackageConfig;
  },
  packageData: function () {
    return Packages.findOne({
      name: "reaction-stripe",
      shopId: Reaction.getShopId()
    });
  }
});

Template.stripe.helpers({
  packageData: function () {
    return Packages.findOne({
      name: "reaction-stripe",
      shopId: Reaction.getShopId()
    });
  }
});

Template.stripe.events({
  "click [data-event-action=showStripeSettings]": function () {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "stripe-update-form": {
    /* eslint-disable no-unused-vars*/
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Stripe settings saved.", "success");
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Stripe settings update failed. " + error, "danger");
    }
    /* eslint-enable no-unused-vars*/
  }
});
