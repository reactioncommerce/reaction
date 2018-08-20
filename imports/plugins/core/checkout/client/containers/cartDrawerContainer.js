import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { getPrimaryMediaForOrderItem, ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import CartDrawer from "../components/cartDrawer";

// event handlers to pass in as props
const handlers = {
  handleImage(item) {
    const media = getPrimaryMediaForOrderItem(item);
    return media && media.url({ store: "small" });
  },

  handleShowProduct(productItem) {
    if (productItem) {
      Reaction.Router.go("product", {
        handle: productItem.productId,
        variantId: productItem.variantId
      });

      ReactionProduct.setCurrentVariant(productItem.variantId);
    }
  },

  pdpPath(productItem) {
    if (productItem) {
      const handle = productItem.productSlug || productItem.productId;
      return Reaction.Router.pathFor("product", {
        hash: {
          handle,
          variantId: productItem.variantId
        }
      });
    }
    return "";
  },

  handleRemoveItem(event, item) {
    event.stopPropagation();
    event.preventDefault();
    const cartItemElement = $(event.target).closest(".cart-drawer-swiper-slide");
    const { cart, token } = getCart();
    if (!cart) return;

    cartItemElement.fadeOut(500, () => Meteor.call("cart/removeFromCart", cart._id, token, item._id));
  },

  handleCheckout() {
    document.querySelector("#cart-drawer-container").classList.remove("opened");
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
};

/**
 * @name composer
 * @private
 * @summary Subscribes to images for products in cart & passes cart products to CartDrawer
 * @param {Object} props - React props
 * @param {Function} onData - Function to call when data is ready
 * @returns {undefined}
 */
function composer(props, onData) {
  const { cart } = getCart();
  if (!cart) return;

  Meteor.subscribe("CartImages", cart._id);

  const productItems = cart && cart.items;
  onData(null, {
    productItems
  });
}

// register the containers
registerComponent("CartDrawer", CartDrawer, [
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(CartDrawer);
