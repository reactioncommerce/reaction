import React, { Component } from "react";
import { compose } from "recompose";
import { registerComponent, composeWithTracker, withMomentTimezone } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { Countries } from "/client/collections";
import { Shops } from "/lib/collections";
import LocalizationSettings from "../components/localizationSettings";

const wrapComponent = (Comp) => (
  class LocalizationSettingsContainer extends Component {
    static propTypes = LocalizationSettings.propTypes

    handleUpdateLanguageConfiguration = (event, isChecked, name) => {
      const language = this.props.languages.find((l) => l.value === name);

      if (language) {
        Meteor.call("shop/updateLanguageConfiguration", language.value, isChecked);
      }
    }

    handleUpdateCurrencyConfiguration = (event, isChecked, name) => {
      Meteor.call("shop/updateCurrencyConfiguration", name, isChecked);
    }

    handleSubmit = (doc) => {
      Shops.update({
        _id: doc._id
      }, {
        $set: {
          timezone: doc.timezone,
          currency: doc.currency,
          baseUOM: doc.baseUOM,
          baseUOL: doc.baseUOL,
          language: doc.language
        }
      });
    }

    handleEnableAllLanguages = (isEnabled) => {
      Meteor.call("shop/updateLanguageConfiguration", "all", isEnabled);
    }

    handleEnableAllCurrencies = (isEnabled) => {
      Meteor.call("shop/updateCurrencyConfiguration", "all", isEnabled);
    }

    handleTranslationReload = (flushAll) => {
      if (flushAll === true) {
        Alerts.toast(i18next.t("admin.i18nSettings.reloadAllStarted", { defaultValue: "Reloading translations for all shops." }), "info");

        Meteor.call("i18n/flushTranslations", (error) => {
          if (!error) {
            Alerts.toast(i18next.t("admin.i18nSettings.reloadAllSuccess", { defaultValue: "Translations have been reloaded for all shops." }), "success");
          } else {
            Alerts.toast(i18next.t("admin.i18nSettings.reloadAllFail", { defaultValue: "Translations could not be reloaded for all shops." }), "error");
          }
        });
      } else {
        Alerts.toast(i18next.t("admin.i18nSettings.reloadStarted", { defaultValue: "Reloading translations for the current shop." }), "info");

        Meteor.call("i18n/flushTranslations", (error) => {
          if (!error) {
            Alerts.toast(i18next.t("admin.i18nSettings.reloadSuccess", { defaultValue: "Translations have been reloaded for the current shop." }), "success");
          } else {
            Alerts.toast(i18next.t("admin.i18nSettings.reloadFail", { defaultValue: "Translations could not be reloaded for the current shop." }), "error");
          }
        });
      }
    }

    render() {
      return (
        <Comp
          {...this.props}
          onEnableAllCurrencies={this.handleEnableAllCurrencies}
          onEnableAllLanguages={this.handleEnableAllLanguages}
          onUpdateCurrencyConfiguration={this.handleUpdateCurrencyConfiguration}
          onUpdateLanguageConfiguration={this.handleUpdateLanguageConfiguration}
          onUpdateLocalization={this.handleSubmit}
          onReloadTranslations={this.handleTranslationReload}
        />
      );
    }
  }
);

function composer(props, onData) {
  const languages = [];
  const shop = Shops.findOne();
  const countries = Countries.find().fetch();
  const preferences = Reaction.getUserPreferences("reaction-i18n", "settingsCards", {});

  if (typeof shop === "object" && shop.languages) {
    for (const language of shop.languages) {
      const i18nKey = `languages.${language.label.toLowerCase()}`;
      languages.push({
        label: language.label,
        value: language.i18n,
        enabled: (language.i18n === shop.language || language.enabled),
        i18nKey
      });
    }
  }

  const { currencies } = shop;
  const currencyList = [];
  const currencyOptions = [];
  for (const currency in currencies) {
    if ({}.hasOwnProperty.call(currencies, currency)) {
      if (currency === "updatedAt") {
        continue;
      }

      const structure = currencies[currency];
      const label = `${currency}  |  ${structure.symbol}  |  ${structure.format}`;

      currencyList.push({
        name: currency,
        label,
        enabled: (structure.enabled || currency === shop.currency)
      });

      if (structure.enabled || currency === shop.currency) {
        currencyOptions.push({
          label,
          value: currency
        });
      }
    }
  }


  const { unitsOfMeasure } = Shops.findOne();
  const uomOptions = [];
  if (Array.isArray(unitsOfMeasure)) {
    for (const measure of unitsOfMeasure) {
      uomOptions.push({
        label: i18next.t(`uom.${measure.uom}`, { defaultValue: measure.uom }),
        value: measure.uom
      });
    }
  }

  const { unitsOfLength } = Shops.findOne();
  const uolOptions = [];
  if (Array.isArray(unitsOfLength)) {
    for (const length of unitsOfLength) {
      uolOptions.push({
        label: i18next.t(`uol.${length.uol}`, { defaultValue: length.uol }),
        value: length.uol
      });
    }
  }

  const label = i18next.t("app.timezoneOptions", "Choose timezone");
  const timezoneOptions = [{
    value: "",
    label
  }];
  const moment = props.momentTimezone;
  if (moment) {
    const timezones = moment.names();
    for (const timezone of timezones) {
      timezoneOptions.push({
        value: timezone,
        label: timezone
      });
    }
  }

  onData(null, {
    preferences,
    shop,
    languages,
    currencies: currencyList,
    enabledLanguages: languages.filter((language) => (language.enabled || language.value === shop.language)),
    countryOptions: countries,
    currencyOptions,
    uomOptions,
    uolOptions,
    timezoneOptions
  });
}

registerComponent("i18nSettings", LocalizationSettings, [
  withMomentTimezone,
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  withMomentTimezone,
  composeWithTracker(composer),
  wrapComponent
)(LocalizationSettings);
