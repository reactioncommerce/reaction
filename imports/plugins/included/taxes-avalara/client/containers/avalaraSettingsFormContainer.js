import _ from "lodash";
import { compose, withProps } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";
import { AvalaraSettingsForm } from "../components";
import { Logs as LogSchema } from "/lib/collections/schemas/logs";
import { Countries } from "/client/collections";

/**
 * @file This is a container for AvalaraSettingsForm.
 * @module avalaraSettingsFormContainer
 */

const handlers = {
  /**
    * handleSubmit
    * @method
    * @summary event handler for when new Avalara settings are submitted.
    * @param {Object} event - event info.
    * @param {Object} changedInfo - info about the new Avalara settings.
    * @param {String} targetField - where to save the new settings in the Avalara Package.
    * @return {null} - returns nothing
    */
  handleSubmit(event, changedInfo, targetField) { // eslint-disable-line no-unused-vars
    if (!changedInfo.isValid) {
      return;
    }
    Meteor.call("package/update", "taxes-avalara", "settings", changedInfo.doc.settings, (error) => {
      if (error) {
        Alerts.toast(
          i18next.t("admin.update.avalaraUpdateFailed", { defaultValue: "Failed to update Avalara settings." }),
          "error"
        );
        return;
      }
      Alerts.toast(
        i18next.t("admin.update.avalaraUpdateSucceeded", { defaultValue: "Avalara settings updated." }),
        "success"
      );
    });
  },

  handleTestCredentials(event, settings) {
    Meteor.call("avalara/testCredentials", settings.avalara, function (error, result) {
      if (error && error.message) {
        return Alerts.toast(`${i18next.t("settings.testCredentialsFailed")} ${error.message}`, "error");
      }
      try {
        const statusCode = _.get(result, "statusCode");
        const connectionValid = _.inRange(statusCode, 400);
        if (connectionValid) {
          return Alerts.toast(i18next.t("settings.testCredentialsSuccess"), "success");
        }
        return Alerts.toast(i18next.t("settings.testCredentialsFailed"), "error");
      } catch (e) {
        return Alerts.toast(i18next.t("settings.testCredentialsFailed"), "error");
      }
    });
  }
};

const countryDefaults = ["US", "CA"];
let validCountries = null;

const composer = (props, onData) => {
  const shownFields = {
    ["settings.avalara.apiLoginId"]: AvalaraPackageConfig._schema["settings.avalara.apiLoginId"],
    ["settings.avalara.username"]: AvalaraPackageConfig._schema["settings.avalara.username"],
    ["settings.avalara.password"]: AvalaraPackageConfig._schema["settings.avalara.password"],
    ["settings.avalara.companyCode"]: AvalaraPackageConfig._schema["settings.avalara.companyCode"],
    ["settings.avalara.shippingTaxCode"]: AvalaraPackageConfig._schema["settings.avalara.shippingTaxCode"],
    ["settings.addressValidation.enabled"]: AvalaraPackageConfig._schema["settings.addressValidation.enabled"],
    ["settings.addressValidation.countryList"]: AvalaraPackageConfig._schema["settings.addressValidation.countryList"],
    ["settings.avalara.requestTimeout"]: AvalaraPackageConfig._schema["settings.avalara.requestTimeout"],
    ["settings.avalara.mode"]: AvalaraPackageConfig._schema["settings.avalara.mode"],
    ["settings.avalara.performTaxCalculation"]: AvalaraPackageConfig._schema["settings.avalara.performTaxCalculation"],
    ["settings.avalara.enableLogging"]: AvalaraPackageConfig._schema["settings.avalara.enableLogging"],
    ["settings.avalara.logRetentionDuration"]: AvalaraPackageConfig._schema["settings.avalara.logRetentionDuration"],
    ["settings.avalara.commitDocuments"]: AvalaraPackageConfig._schema["settings.avalara.commitDocuments"]
  };
  const hiddenFields = [
    "settings.avalara.enabled",
    "settings.avalara.companyId"
  ];

  validCountries = validCountries || Countries.find({ value: { $in: countryDefaults } }).fetch();

  const fieldsProp = {
    "settings.addressValidation.countryList": {
      renderComponent: "multiselect",
      options: validCountries,
      defaultValue: _.map(validCountries, "value")
    },
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
      inputType: "password"
    }
  };

  const logFieldsProp = {
    data: {
      renderComponent: "string",
      multiline: true,
      maxRows: 15
    },
    date: {
      disabled: true
    }
  };

  const shownLogFields = {
    date: LogSchema._schema.date,
    data: LogSchema._schema.data
  };


  const shopId = Reaction.getShopId();
  const packageSub = Meteor.subscribe("Packages", shopId);
  if (packageSub.ready()) {
    const packageData = Reaction.getPackageSettings("taxes-avalara");
    onData(null,
      {
        settings: packageData.settings,
        shownFields,
        hiddenFields,
        fieldsProp,
        shownLogFields,
        logFieldsProp
      });
  }
};

registerComponent("AvalaraSettingsForm", AvalaraSettingsForm, [
  withProps(handlers), composeWithTracker(composer)
]);

export default compose(withProps(handlers), composeWithTracker(composer))(AvalaraSettingsForm);
