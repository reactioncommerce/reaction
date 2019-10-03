import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { StripePackageConfig } from "../../lib/collections/schemas";
import { STRIPE_PACKAGE_NAME } from "../util/constants";

/**
 * @summary get Stripe Package record
 * @returns {Object} Package data
 */
function packageData() {
  return Packages.findOne({
    name: STRIPE_PACKAGE_NAME,
    shopId: Reaction.getShopId()
  });
}

Template.stripeSettings.helpers({
  StripePackageConfig() {
    return StripePackageConfig;
  },
  packageData
});

Template.stripe.helpers({
  packageData
});

Template.stripe.events({
  "click [data-event-action=showStripeSettings]"() {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "stripe-update-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError(error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
