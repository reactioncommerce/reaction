import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { StripePackageConfig } from "../../lib/collections/schemas";

Template.stripeSettings.helpers({
  StripePackageConfig() {
    return StripePackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-stripe",
      shopId: Reaction.getShopId()
    });
  },
  marketplaceEnabled() {
    const marketplace = Reaction.getMarketplaceSettings();
    return marketplace && marketplace.enabled;
  }
});

Template.stripe.helpers({
  packageData() {
    return Packages.findOne({
      name: "reaction-stripe",
      shopId: Reaction.getShopId()
    });
  }
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
