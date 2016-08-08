import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { i18next } from "/client/api";
import { TaxPackageConfig } from "/imports/plugins/core/taxes/lib/collections/schemas";

Template.taxJarSettings.helpers({
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
  "taxjar-update-form": {
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
