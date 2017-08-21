/* eslint camelcase: 0 */
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { PaypalExpressPackageConfig } from "../../../lib/collections/schemas";
import "./express.html";

Template.paypalExpressSettings.helpers({
  PaypalExpressPackageConfig: function () {
    return PaypalExpressPackageConfig;
  },
  packageData: function () {
    return Packages.findOne({
      name: "reaction-paypal-express"
    });
  }
});

AutoForm.hooks({
  "express-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function (error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
