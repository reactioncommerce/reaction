import { Template } from "meteor/templating";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";

Template.checkoutAddressBook.onCreated(function () {
  const shipping = Packages.findOne({
    name: "reaction-shipping"
  });

  // on address step of checkout show sidebar when shipping is not configured
  if (!shipping || !shipping.enabled) {
    Reaction.showActionView({
      provides: "settings",
      name: "settings/shipping",
      template: "shippingSettings"
    });
  }
});
