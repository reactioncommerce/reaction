import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
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
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function () {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
