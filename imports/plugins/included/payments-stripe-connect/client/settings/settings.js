import { Template } from "meteor/templating";
import { Reaction, i18next, Router } from "/client/api";
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
  // TODO: Verify that this works and define steps to reproduce.
  // grab stripe connects oauth values and redirect the user
  const authCode = Router.getQueryParam("code");

  Meteor.call("stripeConnect/saveSellerParams", Reaction.getSellerShopId(), authCode, function (err) {
    if (err) {
      // TODO: i18n here
      Alerts.toast("There was an error with saving your seller params from stripe.");
    }
    Reaction.Router.go("/");
  });
});
