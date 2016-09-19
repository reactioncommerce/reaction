import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { TaxCloudPackageConfig } from "../../lib/collections/schemas";

Template.taxCloudSettings.helpers({
  packageConfigSchema() {
    return TaxCloudPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "taxes-taxcloud",
      shopId: Reaction.getShopId()
    });
  }
});


AutoForm.hooks({
  "taxcloud-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("taxSettings.shopTaxMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("taxSettings.shopTaxMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
