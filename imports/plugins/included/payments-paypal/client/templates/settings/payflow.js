/* eslint camelcase: 0 */
import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";
import { PaypalPackageConfig } from "../../../lib/collections/schemas";
import "./payflow.html";

Template.paypalPayFlowSettings.helpers({
  PaypalPackageConfig: function () {
    return PaypalPackageConfig;
  },
  packageData: function () {
    return Packages.findOne({
      name: "reaction-paypal"
    });
  }
});

AutoForm.hooks({
  "paypal-update-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Paypal settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("Paypal settings update failed. " + error, "danger");
    }
  }
});
