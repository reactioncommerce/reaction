import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

/**
 * Inline login form for instance where guest login is needed.
 */
Template.loginInline.events({

  /**
   * Continue as guest.
   * @param  {Event} event - jQuery Event
   * @return {void}
   */
  "click .continue-guest": (event) => {
    event.preventDefault();
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
  }
});
