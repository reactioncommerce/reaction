/* eslint no-unused-vars: 0 */
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
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
    onSuccess: function () {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError: function () {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
