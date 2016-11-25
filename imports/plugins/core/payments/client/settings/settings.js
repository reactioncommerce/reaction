import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Shops, Packages } from "/lib/collections";

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
    const paymentMethods = Reaction.Apps({provides: "paymentMethod"});
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

Template.paymentSettings.events({
  /**
   * toggle payment settings visibility
   * also toggles payment method settings
   * @param  {event} event jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("registry/update", packageId, settingsKey, fields, (error, result) => {
      if (result.numberAffected > 0) {
        // check to see if we should disable the package as well
        const pkg = Packages.findOne(packageId);
        const enabled = pkg.registry.find((registry) => {
          return registry.enabled === true;
        });
        // disable the package if no registry items are enabled.
        // maybe this would be better placed in togglePackage
        if (pkg.enabled !== true && enabled) {
          Meteor.call("shop/togglePackage", packageId, true);
        } else {
          Meteor.call("shop/togglePackage", packageId, false);
        }
      }
    });
  }
});

AutoForm.hooks({
  shopEditPaymentMethodsForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopPaymentMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopPaymentMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
