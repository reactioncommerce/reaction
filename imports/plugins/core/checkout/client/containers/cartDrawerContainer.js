import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { Cart, Media } from "/lib/collections";
import { Reaction } from "/client/api";
import CartDrawer from "../components/cartDrawer";

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

  handleRemoveItem(event) {
    event.stopPropagation();
    event.preventDefault();
    const currentCartItemId = event.target.getAttribute("id");
    $(`#${currentCartItemId}`).fadeOut(500, () => {
      return Meteor.call("cart/removeFromCart", currentCartItemId);
    });
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
  let shopId = Reaction.getPrimaryShopId();
  if (Reaction.marketplace.merchantCarts) {
    shopId = Reaction.getShopId();
  }
  let productItems = Cart.findOne({ userId, shopId }).items;
  let defaultImage;

  productItems = productItems.map((item) => {
    Meteor.subscribe("CartItemImage", item);
    defaultImage = Media.findOne({
      "metadata.variantId": item.variants._id
    });
    if (defaultImage) {
      return Object.assign({}, item, { defaultImage });
    }
    defaultImage = Media.findOne({
      "metadata.productId": item.productId
    });
    return Object.assign({}, item, { defaultImage });
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
