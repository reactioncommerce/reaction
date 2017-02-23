import _ from "lodash";
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

Template.avalaraSettings.events({
  "click [data-event-action=testConnection]": function (event) {
    event.preventDefault();
    event.stopPropagation();
    Meteor.call("avalara/testConnection", function (error, result) {
      const statusCode = _.get(result, "statusCode");
      const connectionValid = _.inRange(statusCode, 400);
      if (statusCode === 401) {
        return Alerts.toast("Connection Test Failed. Save credentials first", "error"); // TODO i18n
      }
      if (connectionValid) {
        return Alerts.toast("Connection Test Success", "success"); // TODO i18n
      }
      return Alerts.toast("Connection Test Failed", "error"); // TODO i18n
    });
  }
});

AutoForm.hooks({
  "avalara-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.taxSettings.shopTaxMethodsSaved"),
        "success");
    },
    onError: function (operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.taxSettings.shopTaxMethodsFailed")} ${error}`, "error"
      );
    }
  }
});
