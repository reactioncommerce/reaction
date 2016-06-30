import { Reaction } from "/client/api";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

Template.paypalCancel.onCreated(() => {
  Session.set("guestCheckoutFlow", true);
  Reaction.Router.go("cart/checkout");
});
