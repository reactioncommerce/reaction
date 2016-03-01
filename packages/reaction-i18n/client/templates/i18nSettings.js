Template.i18nSettings.helpers({
  shop: function () {
    if (ReactionCore.Subscriptions.Shops.ready()) {
      return ReactionCore.Collections.Shops.findOne();
    }
  },
  checked(enabled) {
    return enabled === true ? "checked" : "";
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
        label: i18next.t(`uom.${measure.uom}`, {defaultValue: measure.uom}),
        value: measure.uom
      });
    }
    return uomOptions;
  },
  enabledLanguages: function () {
    let languages = [];
    const shop = ReactionCore.Collections.Shops.findOne();
    if (typeof shop === "object" && shop.languages) {
      for (let language of shop.languages) {
        if (language.enabled === true) {
          languages.push({
            label: language.label,
            value: language.i18n
          });
        }
      }
      return languages;
    }
  },
  languages: function () {
    let languages = [];
    const shop = ReactionCore.Collections.Shops.findOne();
    if (typeof shop === "object" && shop.languages) {
      for (let language of shop.languages) {
        const i18nKey = "languages." + language.label.toLowerCase();
        languages.push({
          label: language.label,
          value: language.i18n,
          enabled: language.enabled,
          i18nKey: i18nKey
        });
      }
      return languages;
    }
  }
});


Template.i18nSettings.events({
  "change input[name=enabled]": (event) => {
    const language = event.target.value;
    const enabled = event.target.checked;
    Meteor.call("shop/updateLanguageConfiguration", language, enabled);
  }
});

AutoForm.hooks({
  shopEditLocalizationSettingsForm: {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopLocalizationSettingsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopLocalizationSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});
