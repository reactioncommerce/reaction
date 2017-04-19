import React, { Component, PropTypes } from "react";
import { Session } from "meteor/session";
import { Cart, Media } from "/lib/collections";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import CartDrawer from "../components/cartDrawer";

class CartDrawerContainer extends Component {
  static propTypes = {
    defaultImage: PropTypes.object,
    lowInventory: PropTypes.bool,
    productItems: PropTypes.array
  }

  handleImage(item) {
    const { defaultImage } = item;
    if (defaultImage && defaultImage.url({ store: "small" })) {
      return defaultImage;
    }
    return false;
  }
  /**
  * showLowInventoryWarning
  * @param {Object} productItem - product item object
  * @return {Boolean} return true if low inventory on variant
  */
  showItemLowInventoryWarning(productItem) {
    const { variants } = productItem;
    if (variants && variants.inventoryPolicy &&
      variants.lowInventoryWarningThreshold) {
      return variants.inventoryQuantity <=
        variants.lowInventoryWarningThreshold;
    }
    return false;
  }

  handleLowInventory = (productItem) => {
    return this.showItemLowInventoryWarning(productItem);
  }

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
  }

  handleRemoveItem(event) {
    event.stopPropagation();
    event.preventDefault();
    const currentCartItemId = event.target.getAttribute("id");
    $(`#${currentCartItemId}`).fadeOut(500, () => {
      return Meteor.call("cart/removeFromCart", currentCartItemId);
    });
  }
  handleCheckout() {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
  render() {
    const { productItems } = this.props;
    return (
      <CartDrawer
        productItems={productItems}
        pdpPath={this.pdpPath}
        handleLowInventory={this.handleLowInventory}
        handleImage={this.handleImage}
        handleRemoveItem={this.handleRemoveItem}
        handleCheckout={this.handleCheckout}
      />
    );
  }
}

function composer(props, onData) {
  const userId = Meteor.userId();
  const shopId = Reaction.getShopId();
  let productItems = Cart.findOne({ userId, shopId }).items;

  productItems = productItems.map((item) => {
    const defaultImage = Media.findOne({
      "metadata.variantId": item.variants._id
    });
    return Object.assign({}, item, { defaultImage });
  });
  onData(null, {
    productItems
  });
}

export default composeWithTracker(composer, Loading)(CartDrawerContainer);
