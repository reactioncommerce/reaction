import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next, Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import { Packages } from "/lib/collections";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import GeneralTaxSettings from "../components/GeneralTaxSettings";
import withTaxServices from "../hoc/withTaxServices";

const PACKAGE_NAME = "reaction-taxes";

/**
 * @returns {Object|null} Settings from Packages collection for the current shop
 */
function getPluginSettings() {
  // Get plugin settings for the current shop
  const plugin = Packages.findOne({ name: PACKAGE_NAME, shopId: Reaction.getShopId() });
  if (!plugin) return null;
  return plugin.settings;
}

/**
 * @summary Updates settings for this plugin for the current shop
 * @param {Object} newSettings The updated settings object
 * @returns {Promise<Object>} Result
 */
function updatePluginSettings(newSettings) {
  return new Promise((resolve, reject) => {
    Meteor.call("package/update", PACKAGE_NAME, "settings", newSettings, (error, result) => {
      if (error) {
        Logger.error(error);
        Alerts.toast(`${i18next.t("admin.settings.settingsSaveFailure")} ${error}`, "error");
        reject(error);
      } else {
        Alerts.toast(i18next.t("admin.settings.settingsSaveSuccess"), "success");
        resolve(result);
      }
    });
  });
}

const handlers = {
  onSubmit: updatePluginSettings
};

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const settingsDoc = getPluginSettings();

  getOpaqueIds([{ namespace: "Shop", id: shopId }])
    .then(([opaqueShopId]) => {
      onData(null, {
        settingsDoc,
        shopId: opaqueShopId
      });
      return null;
    })
    .catch((error) => {
      Logger.error(error);
    });
};

registerComponent("GeneralTaxSettings", GeneralTaxSettings, [
  withProps(handlers),
  composeWithTracker(composer),
  withTaxServices
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer),
  withTaxServices
)(GeneralTaxSettings);
