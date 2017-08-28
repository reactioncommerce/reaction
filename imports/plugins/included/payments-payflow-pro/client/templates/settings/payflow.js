/* eslint camelcase: 0 */
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { PayflowProPackageConfig } from "../../../lib/collections/schemas";
import "./payflow.html";

Template.paypalPayFlowSettings.helpers({
  PayflowProPackageConfig: function () {
    return PayflowProPackageConfig;
  },
  packageData: function () {
    return Packages.findOne({
      name: "reaction-payflow-pro"
    });
  }
});

AutoForm.hooks({
  "payflow-update-form": {
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function (error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
