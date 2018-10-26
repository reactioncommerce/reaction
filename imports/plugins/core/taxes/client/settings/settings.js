import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { TaxCodes } from "../../lib/collections";
import { i18next } from "/client/api";

/*
 * Template taxes Helpers
 */
Template.taxSettings.onCreated(function () {
  this.autorun(() => {
    this.subscribe("TaxCodes");
  });
});

Template.taxSettings.helpers({
  checked(enabled) {
    if (enabled === true) {
      return "checked";
    }
    return "";
  },
  shown(enabled) {
    if (enabled !== true) {
      return "hidden";
    }
    return "";
  },
  // prepare and return taxCodes
  // for default shop value
  //
  taxCodes() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const taxCodes = TaxCodes.find().fetch();
      const options = [{
        label: i18next.t("app.auto"),
        value: "none"
      }];

      for (const taxCode of taxCodes) {
        options.push({
          label: i18next.t(taxCode.label),
          value: taxCode.id
        });
      }
      return options;
    }
    return undefined;
  }
});

Template.taxSettings.events({
  "change input[name=enabled]": (event) => {
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // save tax registry updates
    Meteor.call("registry/update", packageId, settingsKey, fields);
  }
});
