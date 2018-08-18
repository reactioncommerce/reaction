import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Components } from "@reactioncommerce/reaction-components";
import ReactComponentOrBlazeTemplate from "/imports/plugins/core/components/lib/ReactComponentOrBlazeTemplate";

/*
 * Template shipping helpers
 */
Template.shippingSettings.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });
});

Template.shippingSettings.helpers({
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
  parcelSizeSettings() {
    return Components.ParcelSizeSettings;
  },
  ReactComponentOrBlazeTemplate() {
    return ReactComponentOrBlazeTemplate;
  }
});

// toggle shipping methods visibility
// also toggles shipping method settings
Template.shippingSettings.events({
  "change input.checkbox-switch.shipping-settings[name=enabled]": (event) => {
    event.preventDefault();
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // save shipping registry updates
    if (packageId) {
      // update package registry
      Meteor.call("registry/update", packageId, settingsKey, fields);
      // also update shipping provider status
      Meteor.call("shipping/provider/toggle", packageId, settingsKey);
    }
  }
});
