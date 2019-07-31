import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction, Router, i18next } from "client/api";
import { Components } from "@reactioncommerce/reaction-components";

Template.stripeConnectAuthorize.onCreated(() => {
  const shopId = Reaction.Router.getQueryParam("state");
  const authCode = Reaction.Router.getQueryParam("code");
  const error = Reaction.Router.getQueryParam("error");

  if (error) {
    return Alerts.toast(`${i18next.t("admin.connect.shopUserDeniedRequest")}`, "error");
  }

  if (shopId && authCode) {
    Meteor.call("stripe/connect/authorizeMerchant", shopId, authCode, (err) => {
      if (error) {
        Alerts.toast(`${i18next.t("admin.connect.stripeConnectAccountLinkFailure")} ${err}`, "error");
      } else {
        Alerts.toast(`${i18next.t("admin.connect.stripeConnectAccountLinkSuccess")}`, "success");
      }
      Router.go("/");
    });
  }

  return null;
});

Template.stripeConnectAuthorize.helpers({
  loading() {
    return Components.Loading;
  }
});
