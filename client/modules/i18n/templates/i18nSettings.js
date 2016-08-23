import i18next from "i18next";
import { Countries } from "/client/collections";
import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.i18nSettings.helpers({
  shop() {
    if (Reaction.Subscriptions.Shops.ready()) {
      return Shops.findOne();
    }
    return null;
  },
  checked(enabled) {
    return enabled === true ? "checked" : "";
  },
  countryOptions() {
    return Countries.find().fetch();
  },
  currencyOptions() {
    const currencies = Shops.findOne().currencies;
    const currencyOptions = [];
    for (const currency in currencies) {
      if ({}.hasOwnProperty.call(currencies, currency)) {
        const structure = currencies[currency];
        currencyOptions.push({
          label: currency + "  |  " + structure.symbol + "  |  " +
            structure.format,
          value: currency
        });
      }
    }
    return currencyOptions;
  },
  uomOptions() {
    const unitsOfMeasure = Shops.findOne().unitsOfMeasure;
    const uomOptions = [];
    for (const measure of unitsOfMeasure) {
      uomOptions.push({
        label: i18next.t(`uom.${measure.uom}`, {defaultValue: measure.uom}),
        value: measure.uom
      });
    }
    return uomOptions;
  },
  enabledLanguages() {
    const languages = [];
    const shop = Shops.findOne();
    if (typeof shop === "object" && shop.languages) {
      for (const language of shop.languages) {
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
  languages() {
    const languages = [];
    const shop = Shops.findOne();
    if (typeof shop === "object" && shop.languages) {
      for (const language of shop.languages) {
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
    onSuccess() {
      return Alerts.toast(i18next.t("shopSettings.shopLocalizationSettingsSaved"),
        "success");
    },
    onError(operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopLocalizationSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});
