import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
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
      if (!TaxCodes.findOne({ taxCodeProvider: "taxes-taxcloud" })) {
        Meteor.call("taxcloud/getTaxCodes", (err, res) => {
          if (err) {
            throw new Meteor.Error(500, "description");
          } else if (res && Array.isArray(res)) {
            Alerts.toast(i18next.t("admin.taxSettings.shopTaxMethodsSaved"),
              "success");
            res.forEach((code) => {
              Meteor.call("taxes/insertTaxCodes", Reaction.getShopId(), code, "taxes-taxcloud", (error) => {
                if (error) {
                  throw new Meteor.Error("Error populating TaxCodes collection", error);
                }
              });
            });
          }
        });
      }
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.taxSettings.shopTaxMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
