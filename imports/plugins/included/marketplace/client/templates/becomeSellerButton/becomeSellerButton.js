import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";


// Page


// Button
Template.becomeSellerButton.helpers({
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


Template.becomeSellerButton.events({
  "click [data-event-action='button-click-become-seller']": function () {
    Meteor.call("shop/createShop", Meteor.userId(), function (error) {
      if (error) {
        const errorMessage = i18next.t("marketplace.errorCannotCreateShop", { defaultValue: "Could not create shop for current user {{user}}" });
        return Alerts.toast(errorMessage, "error");
      }

      const success = i18next.t("marketplace.yourShopIsReady", { defaultValue: "Your shop is now ready!" });
      return Alerts.toast(success, "success");
    });
  }
});
