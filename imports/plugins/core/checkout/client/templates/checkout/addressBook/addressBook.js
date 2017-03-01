import { Template } from "meteor/templating";
import { Reaction } from "/client/api";

Template.checkoutAddressBook.onCreated(function () {
  Reaction.showActionView({
    provides: "settings",
    name: "settings/shipping",
    template: "shippingSettings"
  });
});
