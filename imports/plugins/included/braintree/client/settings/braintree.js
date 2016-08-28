/* eslint no-unused-vars: 0 */
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { BraintreePackageConfig } from "../../lib/collections/schemas";

import "./braintree.html";

Template.braintreeSettings.helpers({
  BraintreePackageConfig: function () {
    return BraintreePackageConfig;
  },

  packageData: function () {
    return Packages.findOne({
      name: "reaction-braintree"
    });
  }
});

Template.braintree.helpers({
  packageData: function () {
    const packageData = Packages.findOne({
      name: "reaction-braintree"
    });
    return packageData;
  }
});

Template.braintree.events({
  "click [data-event-action=showBraintreeSettings]": function () {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "braintree-update-form": {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Braintree settings saved.", "success");
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Braintree settings update failed. " + error, "danger");
    }
  }
});
