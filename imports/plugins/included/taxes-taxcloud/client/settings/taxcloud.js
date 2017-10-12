import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Packages } from "/lib/collections";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";
import { Reaction, i18next } from "/client/api";
import { TaxCloudPackageConfig } from "../../lib/collections/schemas";
import { TaxCloudSettingsForm } from "../components";

function getPackageData(pkgName) {
  return Packages.findOne({
    name: pkgName,
    shopId: Reaction.getShopId()
  });
}

Template.taxCloudSettings.helpers({
  packageData() {
    return getPackageData("taxes-taxcloud");
  },
  taxCloudCard() {
    const providerName = "taxcloud";
    const packageName = "taxes-taxcloud";
    const packageData = getPackageData(packageName);
    return {
      component: TaxCloudSettingsForm,
      schema: TaxCloudPackageConfig,
      doc: { settings: { ...packageData.settings } },
      docPath: `settings.${providerName}`,
      name: `settings.${providerName}`,
      fields: {
        [`settings.${providerName}.apiKey`]: TaxCloudPackageConfig._schema[`settings.${providerName}.apiKey`],
        [`settings.${providerName}.apiLoginId`]: TaxCloudPackageConfig._schema[`settings.${providerName}.apiLoginId`]
      },
      hideFields: [
        `settings.${providerName}.enabled`,
        `settings.${providerName}.refreshPeriod`,
        `settings.${providerName}.taxCodeUrl`

      ],
      handleSubmit: () => { console.log("Tried to change tax cloud settings."); }
    };
  }
});


AutoForm.hooks({
  "taxcloud-update-form": {
    onSuccess: function () {
      if (!TaxCodes.findOne({ taxCodeProvider: "taxes-taxcloud" })) {
        Meteor.call("taxcloud/getTaxCodes", (err, res) => {
          if (res && Array.isArray(res)) {
            Alerts.toast(i18next.t("admin.taxSettings.shopTaxMethodsSaved"),
              "success");
            res.forEach((code) => {
              Meteor.call("taxes/insertTaxCodes", Reaction.getShopId(), code,
                "taxes-taxcloud");
            });
          }
        });
      } else {
        Alerts.toast(i18next.t("admin.taxSettings.shopTaxMethodsAlreadySaved"),
          "success");
      }
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.taxSettings.shopTaxMethodsFailed")} ${error}`,
        "error");
    }
  }
});
