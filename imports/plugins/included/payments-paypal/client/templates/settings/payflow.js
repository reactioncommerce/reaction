/* eslint camelcase: 0 */
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { PaypalPackageConfig } from "../../../lib/collections/schemas";
import "./payflow.html";

Template.paypalPayFlowSettings.helpers({
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
  "paypal-update-form-payflow": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
