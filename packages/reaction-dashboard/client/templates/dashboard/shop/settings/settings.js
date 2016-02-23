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
  countryOptions: function () {
    return ReactionCore.Collections.Countries.find().fetch();
  },
  currencyOptions: function () {
    const currencies = ReactionCore.Collections.Shops.findOne().currencies;
    const currencyOptions = [];
    for (let currency in currencies) {
      if ({}.hasOwnProperty.call(currencies, currency)) {
        let structure = currencies[currency];
        currencyOptions.push({
          label: currency + "  |  " + structure.symbol + "  |  " +
            structure.format,
          value: currency
        });
      }
    }
    return currencyOptions;
  },
  uomOptions: function () {
    const unitsOfMeasure = ReactionCore.Collections.Shops.findOne().unitsOfMeasure;
    const uomOptions = [];
    for (let measure of unitsOfMeasure) {
      uomOptions.push({
        label: i18n.t(`uom.${measure.uom}`),
        value: measure.uom
      });
    }
    return uomOptions;
  },
  paymentMethodOptions() {
    const paymentMethods = ReactionCore.Apps({provides: "paymentMethod"});
    const options = [{
      label: i18n.t("app.auto"),
      value: "none"
    }];

    if (paymentMethods && _.isArray(paymentMethods)) {
      for (let method of paymentMethods) {
        options.push({
          label: i18n.t(method.i18nKeyLabel),
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
      return Alerts.toast(i18n.t("shopSettings.shopGeneralSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18n.t("shopSettings.shopGeneralSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess: function () {
      return Alerts.toast(i18n.t("shopSettings.shopAddressSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18n.t("shopSettings.shopAddressSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditEmailForm: {
    onSuccess: function () {
      return Alerts.toast(i18n.t("shopSettings.shopMailSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(`${i18n.t("shopSettings.shopMailSettingsFailed")
        } ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess: function () {
      return Alerts.toast(
        i18n.t("shopSettings.shopExternalServicesSettingsSaved"), "success"
      );
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18n.t("shopSettings.shopExternalServicesSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditLocalizationSettingsForm: {
    onSuccess: function () {
      return Alerts.toast(i18n.t("shopSettings.shopLocalizationSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18n.t("shopSettings.shopLocalizationSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess: function () {
      return Alerts.toast(i18n.t("shopSettings.shopOptionsSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18n.t("shopSettings.shopOptionsSettingsFailed")} ${error}`, "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditPaymentMethodsForm: {
    onSuccess: function () {
      return Alerts.toast(i18n.t("shopSettings.shopPaymentMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18n.t("shopSettings.shopPaymentMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
