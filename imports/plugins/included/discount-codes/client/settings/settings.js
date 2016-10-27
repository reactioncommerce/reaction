import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { DiscountCodesPackageConfig } from "../../lib/collections/schemas";

Template.discountCodeSettings.helpers({
  packageConfigSchema() {
    return DiscountCodesPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "discounts-codes",
      shopId: Reaction.getShopId()
    });
  }
});


AutoForm.hooks({
  "discountCodeSettings-update-form": {
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
