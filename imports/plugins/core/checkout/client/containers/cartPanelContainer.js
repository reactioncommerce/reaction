import { withProps } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import CartPanel from "../components/cartPanel";

const handlers = {
  checkout() {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
};

registerComponent("CartPanel", CartPanel, withProps(handlers));

export default withProps(handlers)(CartPanel);
