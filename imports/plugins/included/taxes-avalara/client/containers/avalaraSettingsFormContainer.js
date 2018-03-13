import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { compose, withProps } from "recompose";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";
import { AvalaraSettingsForm } from "../components";
import { Logs as LogSchema } from "/lib/collections/schemas/logs";
import { Countries } from "/client/collections";

/**
 * @file This is a container for AvalaraSettingsForm.
 * @module avalaraSettingsFormContainer
 */
const countryDefaults = ["US", "CA"];

const formSettings = {
  shownFields: {
    "settings.avalara.apiLoginId": AvalaraPackageConfig._schema["settings.avalara.apiLoginId"],
    "settings.avalara.username": AvalaraPackageConfig._schema["settings.avalara.username"],
    "settings.avalara.password": AvalaraPackageConfig._schema["settings.avalara.password"],
    "settings.avalara.companyCode": AvalaraPackageConfig._schema["settings.avalara.companyCode"],
    "settings.avalara.shippingTaxCode": AvalaraPackageConfig._schema["settings.avalara.shippingTaxCode"],
    "settings.addressValidation.enabled": AvalaraPackageConfig._schema["settings.addressValidation.enabled"],
    "settings.addressValidation.countryList": AvalaraPackageConfig._schema["settings.addressValidation.countryList"],
    "settings.avalara.requestTimeout": AvalaraPackageConfig._schema["settings.avalara.requestTimeout"],
    "settings.avalara.mode": AvalaraPackageConfig._schema["settings.avalara.mode"],
    "settings.avalara.performTaxCalculation": AvalaraPackageConfig._schema["settings.avalara.performTaxCalculation"],
    "settings.avalara.enableLogging": AvalaraPackageConfig._schema["settings.avalara.enableLogging"],
    "settings.avalara.logRetentionDuration": AvalaraPackageConfig._schema["settings.avalara.logRetentionDuration"],
    "settings.avalara.commitDocuments": AvalaraPackageConfig._schema["settings.avalara.commitDocuments"]
  },
  hiddenFields: [
    "settings.avalara.enabled",
    "settings.avalara.companyId"
  ],
  fieldsProp: {
    "settings.avalara.mode": {
      renderComponent: "select",
      options: [
        { value: true, label: "Production Mode" },
        { value: false, label: "Testing-Sandbox Mode" }],
      label: undefined
    },
    "settings.avalara.logRetentionDuration": {
      renderComponent: "string",
      inputType: "number"
    },
    "settings.avalara.requestTimeout": {
      renderComponent: "string",
      inputType: "number"
    },
    "settings.avalara.password": {
      renderComponent: "string",
      inputType: "password"
    },
    "settings.avalara.apiLoginId": {
      renderComponent: "string",
      inputType: "text"
    },
    "settings.avalara.username": {
      renderComponent: "string",
      inputType: "text"
    },
    "settings.avalara.companyCode": {
      renderComponent: "string",
      inputType: "text"
    },
    "settings.avalara.shippingTaxCode": {
      renderComponent: "string",
      inputType: "text"
    },
    "settings.addressValidation.enabled": {
      renderComponent: "boolean",
      inputType: "checkbox"
    },
    "settings.avalara.performTaxCalculation": {
      renderComponent: "boolean",
      inputType: "checkbox"
    },
    "settings.avalara.enableLogging": {
      renderComponent: "boolean",
      inputType: "checkbox"
    },
    "settings.avalara.commitDocuments": {
      renderComponent: "boolean",
      inputType: "checkbox"
    }
  },
  logFieldsProp: {
    data: {
      renderComponent: "string",
      multiline: true,
      maxRows: 15
    },
    date: {
      disabled: true
    }
  },
  shownLogFields: {
    date: LogSchema._schema.date,
    data: LogSchema._schema.data
  }
};

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const packageSub = Meteor.subscribe("Packages", shopId);

  const validCountries = Countries.find({ value: { $in: countryDefaults } }).fetch();
  formSettings.fieldsProp["settings.addressValidation.countryList"] = {
    renderComponent: "multiselect",
    options: validCountries,
    defaultValue: validCountries.map((country) => country.value)
  };

  if (packageSub.ready()) {
    const packageData = Reaction.getPackageSettings("taxes-avalara");
    onData(
      null,
      {
        settings: packageData.settings
      }
    );
  }
};

registerComponent("AvalaraSettingsForm", AvalaraSettingsForm, [
  withProps(formSettings), composeWithTracker(composer)
]);

export default compose(withProps(formSettings), composeWithTracker(composer))(AvalaraSettingsForm);
