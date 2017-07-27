import Velocity from "velocity-animate";
import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Cart } from "/lib/collections";
import { Reaction } from "/client/api";
import CartIcon from "../components/cartIcon";

const handlers = {
  handleClick(e) {
    e.preventDefault();
    const cartDrawer = document.querySelector("#cart-drawer-container");
    Velocity(cartDrawer, { opacity: 1 }, 300, () => {
      Reaction.toggleSession("displayCart");
    });
  }
};

const composer = (props, onData) => {
  const subscription = Reaction.Subscriptions.Cart;

  if (subscription.ready()) {
    const cart = Cart.findOne();
    onData(null, { cart });
  }
};

registerComponent("CartIcon", CartIcon, [
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(CartIcon);
