import { Meteor } from "meteor/meteor";
import { Logger, Reaction, i18next } from "/client/api";


// Page


// Button
Template.becomeSellerButton.helpers({
  /**
   * Give it a size and style
   * @return {String} The classes
   */
  classes() {
    var classes = [
      (this.style || 'btn-info'),
      (this.size || '')
    ];

    return classes.join(' ');
  }
});


Template.becomeSellerButton.events({
  "click [data-event-action='button-click-become-seller']": function() {
    Meteor.call("shop/createShop", Meteor.userId(), function(err, response) {
      if(err) {
        return Alerts.toast("Unable to create shop with specified user", "error");
      }

      return Alerts.toast("Your shop is now ready!", "success");
    });
  }
});

