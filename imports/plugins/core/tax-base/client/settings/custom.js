// import { checkNpmVersions } from "meteor/tmeasday:check-npm-versions";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Shops } from "/lib/collections";
import { Countries } from "/client/collections";
import { Taxes, TaxCodes } from "../../lib/collections";
import { i18next } from "/client/api";
import { TaxPackageConfig, Taxes as TaxSchema } from "../../lib/collections/schemas";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { IconButton } from "/imports/plugins/core/ui/client/components";

/* eslint no-shadow: ["error", { "allow": ["options"] }] */

Template.customTaxRates.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Taxes");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isEditing: false
  });
});

Template.customTaxRates.helpers({
  EditButton() {
    const instance = Template.instance();
    const state = instance.state;
    const isEditing = state.equals("isEditing", true);
    const editingId = state.get("editingId");

    return {
      component: IconButton,
      icon: "fa fa-pencil",
      onIcon: "fa fa-check",
      toggle: true,
      toggleOn: isEditing,
      onClick() {
        state.set("isEditing", !isEditing);
        state.set("editingId", !editingId);
      }
    };
  },
  instance() {
    const instance = Template.instance();
    return instance;
  },
  griddleTable() {
    return MeteorGriddle;
  },
  packageConfigSchema() {
    return TaxPackageConfig;
  },
  taxSchema() {
    return TaxSchema;
  },
  taxCollection() {
    return Taxes;
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
  taxRate() {
    const instance = Template.instance();
    const id = instance.state.get("editingId");
    return Taxes.findOne(id);
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
  editRow(options) {
    const instance = Template.instance();
    const currentId = instance.state.get("editingId");
    return (options) => {
      instance.state.set("isEditing", options.props.data);
      // toggle edit mode clicking on same row
      if (currentId === options.props.data._id) {
        instance.state.set("isEditing", false);
        instance.state.set("editingId", null);
      }
      return instance.state.set("editingId", options.props.data._id);
    };
  },
  noDataMessage() {
    return i18next.t("taxSettings.noCustomTaxRatesFound");
  }
});

AutoForm.hooks({
  "customTaxRates-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("taxSettings.shopCustomTaxRatesSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("taxSettings.shopCustomTaxRatesFailed")} ${error}`, "error"
      );
    }
  }
});
