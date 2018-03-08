import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Cart, Media } from "/lib/collections";
import { Reaction } from "/client/api";
import CartDrawer from "../components/cartDrawer";
import { ReactionProduct } from "/lib/api";

// event handlers to pass in as props
const handlers = {
  handleImage(item) {
    const { defaultImage } = item;
    if (defaultImage && defaultImage.url({ store: "small" })) {
      return defaultImage;
    }
    return false;
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

  const productItems = (cart.items || []).map((item) => {
    Meteor.subscribe("CartItemImage", item);
    const variantImage = Media.findOne({ "metadata.variantId": item.variants._id });
    const defaultImage = variantImage || Media.findOne({ "metadata.productId": item.productId });
    return { ...item, defaultImage };
  });
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
