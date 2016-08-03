import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { TaxPackageConfig } from "../../lib/collections/schemas";

Template.avalaraSettings.helpers({
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
  "avalara-update-form": {
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
