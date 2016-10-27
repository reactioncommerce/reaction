import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { DiscountRatesPackageConfig } from "../../lib/collections/schemas";

Template.discountRatesSettings.helpers({
  packageConfigSchema() {
    return DiscountRatesPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "discounts-rates",
      shopId: Reaction.getShopId()
    });
  }
});


AutoForm.hooks({
  "discountRatesSettings-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("discounts.settingsSaveSuccess"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("discounts.settingsSaveFailure")} ${error}`, "error"
      );
    }
  }
});
