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
  const stripeConnectSettings = {
    tokenType: FlowRouter.getQueryParam("token_type"),
    stripePublishableKey: FlowRouter.getQueryParam("stripePublishableKey"),
    scope: FlowRouter.getQueryParam("scope"),
    liveMode: FlowRouter.getQueryParam("livemode"),
    stripeUserId: FlowRouter.getQueryParam("stripe_user_id"),
    refreshToken: FlowRouter.getQueryParam("refresh_token"),
    accessToken: FlowRouter.getQueryParam("access_token")
  };

  /*
   * work in progress!! need to figure out way to get correct shop id for seller. for redirection
   * and saving params correctly.
   */
  Meteor.call("stripeConnect/saveSellerParams", Reaction.getShopId(), stripeConnectSettings, function (err) {
    if (err) {
      Alerts.toast("There was an error with saving your seller params from stripe.");
    }
    Reaction.Router.go("/");
  });
});
