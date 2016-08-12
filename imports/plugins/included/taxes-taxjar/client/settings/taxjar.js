import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { TaxJarPackageConfig } from "../../lib/collections/schemas";

Template.taxJarSettings.helpers({
  packageConfigSchema() {
    return TaxJarPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "taxes-taxjar",
      shopId: Reaction.getShopId()
    });
  }
});


AutoForm.hooks({
  "taxjar-update-form": {
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
