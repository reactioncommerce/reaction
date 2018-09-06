import { withProps } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import CartPanel from "../components/cartPanel";

const handlers = {
  checkout() {
    document.querySelector("#cart-drawer-container").classList.remove("opened");
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
};

registerComponent("CartPanel", CartPanel, withProps(handlers));

export default withProps(handlers)(CartPanel);
