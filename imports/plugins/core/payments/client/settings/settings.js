import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Shops } from "/lib/collections";

Template.paymentSettings.helpers({
  checked(enabled) {
    if (enabled === true) {
      return "checked";
    }
    return "";
  },
  shown(enabled) {
    if (enabled !== true) {
      return "hidden";
    }
    return "";
  },
  paymentMethodOptions() {
    const paymentMethods = Reaction.Apps({ provides: "paymentMethod" });
    const options = [{
      label: i18next.t("app.auto"),
      value: "none"
    }];

    if (paymentMethods && _.isArray(paymentMethods)) {
      for (const method of paymentMethods) {
        if (method.enabled === true) {
          options.push({
            label: i18next.t(method.i18nKeyLabel),
            value: method.settingsKey
          });
        }
      }
    }
    return options;
  },
  shop() {
    return Shops.findOne(Reaction.getShopId());
  }
});

// toggle payment methods visibility
Template.paymentSettings.events({
  "change input[name=enabled]": (event) => {
    event.preventDefault();
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // update package registry
    if (packageId) {
      Meteor.call("registry/update", packageId, settingsKey, fields);
      Meteor.call("shop/togglePackage", packageId, !event.target.checked);
    }
  }
});

AutoForm.hooks({
  shopEditPaymentMethodsForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("shopSettings.shopPaymentMethodsSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("shopSettings.shopPaymentMethodsFailed")} ${error}`, "error");
    }
  }
});
