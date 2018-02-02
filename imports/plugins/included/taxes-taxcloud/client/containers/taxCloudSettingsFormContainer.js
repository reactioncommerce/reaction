import { compose, withProps } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { TaxCloudPackageConfig } from "../../lib/collections/schemas";
import { TaxCloudSettingsForm } from "../components";

/**
 * @file This is a container for TaxCloudSettingsForm.
 * @module taxCloudSettingsFormContainer
 */

const handlers = {
  /**
    * handleSubmit
    * @method
    * @summary event handler for when new TaxCloud settings are submitted.
    * @param {Object} event - event info.
    * @param {Object} changedInfo - info about the new TaxCloud settings.
    * @param {String} targetField - where to save the new settings in the TaxCloud Package.
    * @since 1.5.2
    * @return {null} - returns nothing
    */
  handleSubmit(event, changedInfo, targetField) {
    if (!changedInfo.isValid) {
      return;
    }
    Meteor.call("package/update", "taxes-taxcloud", targetField, changedInfo.doc.settings.taxcloud, (error) => {
      if (error) {
        Alerts.toast(
          i18next.t("admin.update.updateFailed", { defaultValue: "Failed to update TaxCloud settings." }),
          "error"
        );
        return;
      }
      Alerts.toast(
        i18next.t("admin.update.updateSucceeded", { defaultValue: "TaxCloud settings updated." }),
        "success"
      );
    });
  }
};

const composer = (props, onData) => {
  const shownFields = {
    "settings.taxcloud.apiKey": TaxCloudPackageConfig._schema["settings.taxcloud.apiKey"],
    "settings.taxcloud.apiLoginId": TaxCloudPackageConfig._schema["settings.taxcloud.apiLoginId"]
  };
  const hiddenFields = [
    "settings.taxcloud.enabled",
    "settings.taxcloud.refreshPeriod",
    "settings.taxcloud.taxCodeUrl"
  ];

  const shopId = Reaction.getShopId();
  const packageSub = Meteor.subscribe("Packages", shopId);
  if (packageSub.ready()) {
    const packageData = Reaction.getPackageSettings("taxes-taxcloud");
    onData(null, { settings: packageData.settings, shownFields, hiddenFields });
  }
};

registerComponent("TaxCloudSettingsForm", TaxCloudSettingsForm, [
  withProps(handlers), composeWithTracker(composer)
]);

export default compose(withProps(handlers), composeWithTracker(composer))(TaxCloudSettingsForm);
