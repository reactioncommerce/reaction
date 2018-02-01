import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";

Template.connectorSettings.helpers({
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
  }
});

// toggle connector methods visibility
// also toggles connector method settings
Template.connectorSettings.events({
  /**
   * connectorSettings settings update enabled status for connector service on change
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "change input.checkbox-switch.connector-settings[name=enabled]": (event) => {
    event.preventDefault();
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];
    // save connector registry updates
    if (packageId) {
      // update package registry
      Meteor.call("registry/update", packageId, settingsKey, fields);
      // also update connector provider status
      Meteor.call("connectors/connection/toggle", packageId, settingsKey);
    }
  }
});
