import { Reaction } from "/client/api";


Template.paypalCancel.onCreated(() => {
  Session.set("guestCheckoutFlow", true);
  Reaction.Router.go("cart/checkout");
});
