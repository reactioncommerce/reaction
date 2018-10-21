import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { StripeMarketplacePackageConfig } from "../../../lib/collections/schemas";

/**
 * @summary get Stripe Package record
 * @returns {Object} Package data
 */
function packageData() {
  return Packages.findOne({
    name: "reaction-marketplace",
    shopId: Reaction.getShopId()
  });
}

Template.stripeMarketplaceSettings.helpers({
  StripePackageConfig() {
    return StripeMarketplacePackageConfig;
  },
  packageData
});

Template.stripeMarketplace.helpers({
  packageData
});

Template.stripeMarketplace.events({
  "click [data-event-action=showStripeSettings]"() {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "stripe-marketplace-update-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError(error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
