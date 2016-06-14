import { Reaction } from "/client/modules/core";
import { Packages } from "/lib/collections";

Template.paypalDashboard.helpers({
  packageData: function () {
    return Packages.findOne({
      name: "reaction-paypal"
    });
  }
});

Template.paypalDashboard.events({
  "click [data-event-action=showPaypalSettings]": function () {
    Reaction.showActionView();
  }
});
