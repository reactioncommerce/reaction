import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { StripeConnectPackageConfig } from "../../lib/collections/schemas";

import "./settings.html";

Template.stripeConnectSettings.helpers({
  StripeConnectPackageConfig() {
    return StripeConnectPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-stripe-connect",
      shopId: Reaction.getShopId()
    });
  }
});

AutoForm.hooks({
  "stripe-connect-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function () {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});

Template.stripeConnectRedirect.onCreated(function () {
  // grab stripe connects oauth values and redirect the user
  const authCode = FlowRouter.getQueryParam("code");

  /*
   * work in progress!! need to figure out way to get correct shop id for seller. for redirection
   * and saving params correctly.
   */
  Meteor.call("stripeConnect/saveSellerParams", Reaction.getShopId(), authCode, function (err) {
    if (err) {
      Alerts.toast("There was an error with saving your seller params from stripe.");
    }
    Reaction.Router.go("/");
  });
});
