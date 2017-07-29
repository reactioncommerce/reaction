import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { MarketplacePackageConfig } from "../../../lib/collections/schemas";


/**
 * marketplaceSettings helpers
 *
 */
Template.marketplaceSettings.helpers({
  MarketplacePackageConfig() {
    return MarketplacePackageConfig;
  },

  packageData() {
    return Packages.findOne({
      name: "reaction-marketplace",
      shopId: Reaction.getPrimaryShopId()
    });
  }
});

/**
 * marketplace Catalog settings
 */
Template.marketplaceShopSettings.inheritsHelpersFrom("marketplaceSettings");

/**
 * marketplaceSettings autoform alerts
 */

AutoForm.hooks({
  marketplaceOptionsForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.dashboardMarketplaceSettingsSaved"),
        "success");
    },
    onError(operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.settings.dashboardMarketplaceSettingsFailed")} ${error}`, "error"
      );
    }
  }
});
