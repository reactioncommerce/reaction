import { Template } from "meteor/templating";
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
    const paymentMethods = Reaction.Apps({provides: "paymentMethod"});
    const options = [{
      label: i18next.t("app.auto"),
      value: "none"
    }];

    if (paymentMethods && _.isArray(paymentMethods)) {
      for (const method of paymentMethods) {
        options.push({
          label: i18next.t(method.i18nKeyLabel),
          value: method.packageName
        });
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

    Meteor.call("registry/update", packageId, settingsKey, fields);

    // disable package as well. todo: should probably check if there
    // are any remaining payment methods defined and only disable if none
    Meteor.call("shop/togglePackage", packageId, !event.target.checked);
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
