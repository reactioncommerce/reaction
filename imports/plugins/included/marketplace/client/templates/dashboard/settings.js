import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { MarketplacePackageConfig } from "../../../lib/collections/schemas";

/**
 * marketplaceShopSettings helpers
 *
 */
Template.marketplaceShopSettings.helpers({
  MarketplacePackageConfig() {
    return MarketplacePackageConfig;
  },

  packageData() {
    return Packages.findOne({
      name: "reaction-marketplace",
      shopId: Reaction.getPrimaryShopId()
    });
  },
  inviteOwner() {
    return Components.InviteOwner;
  }
});

/**
 * marketplaceSettings autoform alerts
 */

AutoForm.hooks({
  marketplaceOptionsForm: {
    onSuccess() {
      return Alerts.toast(
        i18next.t("admin.settings.dashboardMarketplaceSettingsSaved"),
        "success"
      );
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.settings.dashboardMarketplaceSettingsFailed")} ${error}`, "error");
    }
  }
});
