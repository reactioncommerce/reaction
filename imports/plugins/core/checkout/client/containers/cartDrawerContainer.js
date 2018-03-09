import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Cart } from "/lib/collections";
import { getPrimaryMediaForOrderItem, ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import CartDrawer from "../components/cartDrawer";

// event handlers to pass in as props
const handlers = {
  handleImage(item) {
    const media = getPrimaryMediaForOrderItem(item);
    return media && media.url({ store: "small" });
  },

  /**
  * showLowInventoryWarning
  * @param {Object} productItem - product item object
  * @return {Boolean} return true if low inventory on variant
  */
  handleLowInventory(productItem) {
    const { variants } = productItem;
    if (variants && variants.inventoryPolicy &&
      variants.lowInventoryWarningThreshold) {
      return variants.inventoryQuantity <=
        variants.lowInventoryWarningThreshold;
    }
    return false;
  },

  handleShowProduct(productItem) {
    if (productItem) {
      Reaction.Router.go("product", {
        handle: productItem.productId,
        variantId: productItem.variants._id
      });

      ReactionProduct.setCurrentVariant(productItem.variants._id);
    }
  },

  pdpPath(productItem) {
    if (productItem) {
      const handle = productItem.productId;
      return Reaction.Router.pathFor("product", {
        hash: {
          handle,
          variantId: productItem.variants._id
        }
      });
    }
  },

  handleRemoveItem(event, item) {
    event.stopPropagation();
    event.preventDefault();
    const cartItemElement = $(event.target).closest(".cart-drawer-swiper-slide");
    cartItemElement.fadeOut(500, () => Meteor.call("cart/removeFromCart", item._id));
  },

  handleCheckout() {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
};

// reactive Tracker wrapped function
function composer(props, onData) {
  const userId = Meteor.userId();
  const shopId = Reaction.marketplace.merchantCarts ? Reaction.getShopId() : Reaction.getPrimaryShopId();
  const cart = Cart.findOne({ userId, shopId });
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
