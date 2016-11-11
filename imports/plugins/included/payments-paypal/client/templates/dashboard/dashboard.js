import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { PaypalPackageConfig } from "../../../lib/collections/schemas";


Template.paypalDashboard.helpers({
  PaypalPackageConfig: function () {
    return PaypalPackageConfig;
  },
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
