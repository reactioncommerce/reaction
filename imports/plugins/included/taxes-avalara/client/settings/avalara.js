import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";


Template.avalaraSettings.helpers({
  packageConfigSchema() {
    return AvalaraPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "taxes-avalara",
      shopId: Reaction.getShopId()
    });
  }
});


AutoForm.hooks({
  "avalara-update-form": {
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
