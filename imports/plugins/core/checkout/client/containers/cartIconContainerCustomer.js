import Velocity from "velocity-animate";
import store from "store";
import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { encodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { Reaction } from "/client/api";
import CartIconCustomer from "../components/cartIconCustomer";
import withAccountCart from "/imports/plugins/core/graphql/lib/hocs/withAccountCart";
import withAnonymousCart from "/imports/plugins/core/graphql/lib/hocs/withAnonymousCart";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import withViewer from "/imports/plugins/core/graphql/lib/hocs/withViewer";
import { getSlug } from "/lib/api";

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
  const anonymousCart = store.get("Reaction.anonymousCarts") || [{}];
  const [ { _id: cartId, token } ] = anonymousCart;
  onData(null, { shopSlug: getSlug(Reaction.getShopName().toLowerCase()), cartId: encodeOpaqueId(namespaces.Cart)(cartId), token });
};

registerComponent("CartIconCustomer", CartIconCustomer, [
  withProps(handlers),
  composeWithTracker(composer),
  withShopId,
  withViewer,
  withAccountCart,
  withAnonymousCart
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer),
  withShopId,
  withViewer,
  withAccountCart,
  withAnonymousCart
)(CartIconCustomer);
