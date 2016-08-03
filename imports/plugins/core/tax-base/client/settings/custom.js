// import { checkNpmVersions } from "meteor/tmeasday:check-npm-versions";
import { Template } from "meteor/templating";
import { MeteorGriddle } from "./griddle";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shops, Countries } from "/lib/collections";
import { Taxes, TaxCodes } from "../../lib/collections";
import { i18next } from "/client/api";
import { TaxPackageConfig } from "../../lib/collections/schemas";

Template.customTaxRates.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Taxes");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    editing: false
  });
});

Template.customTaxRates.helpers({
  packageConfigSchema() {
    return TaxPackageConfig;
  },
  countryOptions: function () {
    return Countries.find().fetch();
  },
  country: function () {
    const shop = Shops.findOne();
    if (shop && typeof shop.addressBook === "Array") {
      const country = shop.addressBook[0].country;
      return country;
    }
    return [];
  },
  statesForCountry: function () {
    const shop = Shops.findOne();
    const selectedCountry = AutoForm.getFieldValue("country");
    if (!selectedCountry) {
      return false;
    }
    if ((shop !== null ? shop.locales.countries[selectedCountry].states : void 0) === null) {
      return false;
    }
    options = [];
    if (shop && typeof shop.locales.countries[selectedCountry].states === "object") {
      for (const state in shop.locales.countries[selectedCountry].states) {
        if ({}.hasOwnProperty.call(shop.locales.countries[selectedCountry].states, state)) {
          const locale = shop.locales.countries[selectedCountry].states[state];
          options.push({
            label: locale.name,
            value: state
          });
        }
      }
    }
    return options;
  },
  filteredFields() {
    return ["taxCode", "rate", "country", "region", "postal"];
  },
  Taxes() {
    return Taxes;
  },
  packageData() {
    return Taxes.find();
  },
  taxCodes() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const taxCodes = TaxCodes.find().fetch();
      const options = [{
        label: i18next.t("app.auto"),
        value: "none"
      }];

      for (let taxCode of taxCodes) {
        options.push({
          label: i18next.t(taxCode.label),
          value: taxCode.id
        });
      }
      return options;
    }
    return [];
  },
  griddleTable() {
    return MeteorGriddle;
  },
  editRow(options) {
    return (options ) => {
      const instance = Template.instance();
      console.log(instance.state.get("editing"));
      instance.state.set("editing", options.props.data);
      Session.set("editingTaxCode", options.props.data);
      console.log("here in edit row", options.props.data);
    };
  },
  noDataMessage() {
    return i18next.t("shopSettings.noCustomTaxRatesFound");
  }
});

AutoForm.hooks({
  "customTaxRates-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopCustomTaxRatesSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopCustomTaxRatesFailed")} ${error}`, "error"
      );
    }
  }
});
