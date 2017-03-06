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

 Template.stripeConnect.helpers({
   packageData() {
     return Packages.findOne({
       name: "reaction-stripe-connect",
       shopId: Reaction.getShopId()
     });
   }
 });

 Template.stripeConnect.events({
   "click [data-event-action=showStripeConnectSettings]"() {
     Reaction.showActionView();
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

 Template.stripeConnectRedirect.onCreated( function() {
   //grabs values stripe passes back in the url as the params
   this.autorun(() => {
     FlowRouter.route("https://connect.stripe.com/oauth/authorize", {
       name: "StripeConnect.url",
       action(params, queryParams) {
         console.log("Gathering Stripe Connect URL parameters.");
         let tokenType = FlowRouter.getQueryParam("token_type");
         let stripePublishableKey = FlowRouter.getQueryParams("stripe_publishable_key");
         let scope = FlowRouter.getQueryParams("scope");
         let livemode = FlowRouter.getQueryParams("livemode");
         let stripeUserId = FlowRouter.getQueryParams("stripe_user_id");
         let refreshToken = FlowRouter.getQueryParams("refresh_token");
         let accessToken = FlowRouter.getQueryParams("access_token");
         Meteor.call("stripeConnect/saveSellerParams", Reaction.getShopId(), tokenType, stripePublishableKey, scope, livemode, stripeUserId, refreshToken, accessToken);
       }
     });
   });
 });
