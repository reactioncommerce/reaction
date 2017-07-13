import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";

Template.catalogSettings.helpers({
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

Template.catalogSettings.events({
  /**
   * settings update enabled status for services on change
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

    Meteor.call("registry/update", packageId, settingsKey, fields);
    Meteor.call("shop/togglePackage", packageId, !event.target.checked);
  }
});
