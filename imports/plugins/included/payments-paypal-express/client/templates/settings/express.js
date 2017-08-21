/* eslint camelcase: 0 */
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
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
