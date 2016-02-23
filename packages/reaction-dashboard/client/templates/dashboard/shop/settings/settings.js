/**
 * shopSettings helpers
 *
 */
Template.shopSettings.helpers({
  shop: function () {
    return ReactionCore.Collections.Shops.findOne();
  },
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: "core"
    });
  },
  addressBook: function () {
    const address = ReactionCore.Collections.Shops.findOne().addressBook;
    return address[0];
  },
  paymentMethodOptions() {
    const paymentMethods = ReactionCore.Apps({provides: "paymentMethod"});
    const options = [{
      label: i18next.t("app.auto"),
      value: "none"
    }];

    if (paymentMethods && _.isArray(paymentMethods)) {
      for (let method of paymentMethods) {
        options.push({
          label: i18next.t(method.i18nKeyLabel),
          value: method.packageName
        });
      }
    }
    return options;
  }
});

/**
 * shopSettings autoform alerts
 */

AutoForm.hooks({
  shopEditForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopGeneralSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopGeneralSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopAddressSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopAddressSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditEmailForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopMailSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`${i18next.t("shopSettings.shopMailSettingsFailed")
        } ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess: function () {
      return Alerts.toast(
        i18next.t("shopSettings.shopExternalServicesSettingsSaved"), "success"
      );
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopExternalServicesSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopOptionsSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopOptionsSettingsFailed")} ${error}`, "error"
      );
    }
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
