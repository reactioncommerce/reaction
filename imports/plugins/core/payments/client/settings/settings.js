import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages, Shops } from "/lib/collections";

Template.paymentSettings.helpers({
  //
  // check if this package setting is enabled
  //
  checked(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);
    const setting = pkg.name.split("/").splice(-1);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[setting]) {
        enabled = pkgData.settings[setting].enabled;
      }
    }
    return enabled === true ? "checked" : "";
  },
  //
  // get current packages settings data
  //
  packageData() {
    return Packages.findOne({
      name: "reaction-payments"
    });
  },
  //
  // Template helper to add a hidden class if the condition is false
  //
  shown(pkg) {
    let enabled;
    const pkgData = Packages.findOne(pkg.packageId);
    const setting = pkg.name.split("/").splice(-1);

    if (pkgData && pkgData.settings) {
      if (pkgData.settings[setting]) {
        enabled = pkgData.settings[setting].enabled;
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
   * toggle payment visibility
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    const name = event.target.value;
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    Meteor.call("registry/update", packageId, name, fields);
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
