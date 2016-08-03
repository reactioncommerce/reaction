import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { i18next } from "/client/api";
import { TaxPackageConfig } from "../../lib/collections/schemas";

Template.taxCloudSettings.helpers({
  packageConfigSchema() {
    return TaxPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-taxes"
    });
  }
});


AutoForm.hooks({
  "taxcloud-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("shopSettings.shopTaxMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("shopSettings.shopTaxMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
