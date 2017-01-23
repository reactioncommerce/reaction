import { Template } from "meteor/templating";
/*
 * Template shippinges Helpers
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
  }
});

Template.shippingSettings.events({
  /**
   * shippingSettings settings update enabled status for shipping service on change
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
    // save shipping registry updates
    Meteor.call("registry/update", packageId, settingsKey, fields);
  },

  /**
   * shippingSettings settings show/hide secret key for a shipping service
   * @param  {event} event    jQuery Event
   * @return {void}
   */
  "click [data-event-action=showSecret]": (event) => {
    const button = $(event.currentTarget);
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
