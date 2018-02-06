/* eslint camelcase: 0 */
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { PaypalPackageConfig } from "../../../lib/collections/schemas";
import "./express.html";

Template.paypalExpressSettings.helpers({
  PaypalPackageConfig() {
    return PaypalPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "reaction-paypal"
    });
  }
});

AutoForm.hooks({
  "paypal-update-form-express": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
