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
  /**
   * taxSettings settings update enabled status for tax service on change
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input[name=enabled]": (event) => {
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // save tax registry updates
    Meteor.call("registry/update", packageId, settingsKey, fields);
  },

  /**
   * taxSettings settings show/hide secret key for a tax service
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "click [data-event-action=showSecret]": (event) => {
    const button = Template.instance().$(event.currentTarget);
    const input = button.closest(".form-group").find("input[name=secret]");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      button.html("Hide");
    } else {
      input.attr("type", "password");
      button.html("Show");
    }
  }
});
