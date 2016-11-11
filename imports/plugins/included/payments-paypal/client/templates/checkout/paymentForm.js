import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

Template.paypalPaymentForm.onCreated(function () {
  Meteor.call("getExpressCheckoutSettings", function (error, expressCheckoutSettings) {
    if (!error) {
      return Session.set("expressCheckoutSettings", expressCheckoutSettings);
    }
  });
  return Meteor.call("payflowpro/settings", function (error, payflowSettings) {
    if (!error) {
      return Session.set("payflowSettings", payflowSettings);
    }
  });
});

Template.paypalPaymentForm.helpers({
  expressCheckoutEnabled: function () {
    const expressCheckoutSettings = Session.get("expressCheckoutSettings");
    return expressCheckoutSettings !== undefined ? expressCheckoutSettings.enabled : void 0;
  },
  payflowEnabled: function () {
    const payflowSettings = Session.get("payflowSettings");
    return payflowSettings !== undefined ? payflowSettings.enabled : void 0;
  }
});
