import { Reaction, i18next } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { MarketplacePackageConfig } from "../../../lib/collections/schemas";


/**
 * shopSettings helpers
 *
 */
Template.marketplaceSettings.helpers({
  MarketplacePackageConfig() {
    return MarketplacePackageConfig;
  },

  packageData() {
    return Packages.findOne({
      name: "reaction-marketplace"
    });
  }
});

/**
 * Marketplace Settings autoform alerts
 */

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("shopSettings.shopOptionsSettingsSaved"),
        "success");
    },
    onError(operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopOptionsSettingsFailed")} ${error}`, "error"
      );
    }
  }
});
