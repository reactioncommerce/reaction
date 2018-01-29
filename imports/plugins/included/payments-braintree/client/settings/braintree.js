/* eslint no-unused-vars: 0 */
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";
import { BraintreePackageConfig } from "../../lib/collections/schemas";

import "./braintree.html";

Template.braintreeSettings.helpers({
  BraintreePackageConfig() {
    return BraintreePackageConfig;
  },

  packageData() {
    return Packages.findOne({
      name: "reaction-braintree"
    });
  }
});

Template.braintree.helpers({
  packageData() {
    const packageData = Packages.findOne({
      name: "reaction-braintree"
    });
    return packageData;
  }
});

Template.braintree.events({
  "click [data-event-action=showBraintreeSettings]"() {
    Reaction.showActionView();
  }
});

AutoForm.hooks({
  "braintree-update-form": {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    },
    onError(error) {
      return Alerts.toast(`${i18next.t("admin.settings.saveFailed")} ${error}`, "error");
    }
  }
});
