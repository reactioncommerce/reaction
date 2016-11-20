import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages, Shops } from "/lib/collections";

Template.paymentSettings.helpers({
  //
  // check if this package setting is enabled
  //
  checked(pkg) {
    let enabled;
    console.log(pkg)
    const pkgData = Packages.findOne(pkg.packageId);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[pkg.settingsKey]) {
        enabled = pkgData.settings[pkg.settingsKey].enabled;
      }
    }
    return enabled === true ? "checked" : "";
  },
  //
  // Template helper to add a hidden class if the condition is false
  //
  shown(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[pkg.settingsKey]) {
        enabled = pkgData.settings[pkg.settingsKey].enabled;
      }
    }

    return enabled !== true ? "hidden" : "";
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
  Shops() {
    return Shops;
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
    const name = event.target.value;
    const settings = event.target.getAttribute("data-settings");
    const packageId = event.target.getAttribute("data-id");
    const methods = Reaction.Apps({provides: "paymentMethod", name: name});
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // enable all matching methods for this packageId
    // we could split out sub packages
    for (method of methods) {
      // updates settings.name.enabled
      Meteor.call("registry/update", packageId, name, fields);
    }
    Meteor.call("registry/update", packageId, settings, fields);
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
