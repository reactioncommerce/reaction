import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";


// Page


// Button
Template.stripeConnectSignupButton.helpers({
  /**
   * Give it a size and style
   * @return {String} The classes
   */
  classes() {
    const classes = [
      (this.type || "btn-info"),
      (this.size || "")
    ];

    return classes.join(" ");
  }
});


Template.stripeConnectSignupButton.events({
  "click [data-event-action='button-click-stripe-connect-signup']": function () {
    console.log('clicked');
  }
});

