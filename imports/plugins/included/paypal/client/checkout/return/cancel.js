import { Reaction } from "/client/api";

import "./cancel.html";

Template.paypalCancel.onCreated(() => {
  Session.set("guestCheckoutFlow", true);
  Reaction.Router.go("cart/checkout");
});
