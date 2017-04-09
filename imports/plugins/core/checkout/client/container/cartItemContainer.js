import React, { Component, PropTypes } from "react";
import { Cart, Media } from "/lib/collections";
import CartItems from "../components/cartItems";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";

class CartItemContainer extends Component {
  static propTypes = {
    defaultImage: PropTypes.object,
    lowInventory: PropTypes.bool,
    path: PropTypes.string,
    productItems: PropTypes.array
  }

  handleImage(productItem) {
    const { defaultImage } = productItem;

    if (defaultImage && defaultImage.url({ store: "small" })) {
      return (
        <div className="center-cropped">
          <img src={defaultImage.url({ store: "small" })} className="product-grid-item-images img-responsive" />
        </div>
      );
    }
    return (
      <div
        className="center-cropped"
        style={{ backgroundImage: "url('/resources/placeholder.gif')" }}
      >
        <img src="/resources/placeholder.gif" className="product-grid-item-images img-responsive" />
      </div>
    );
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
    if (this.showItemLowInventoryWarning(productItem)) {
      return (
        <div className="badge badge-low-inv-warning"
          title={productItem.variants.inventoryQuantity}
          data-i18n="cartDrawerItems.left"
        >!</div>);
    }
    return (
      <div>
        <span className="badge">{productItem.quantity}</span>
        <span className="cart-item-title">
          {productItem.title}
          <small>{productItem.variants.title}</small>
        </span>
      </div>
    );
  }

  handleBgImage(productItem) {
    const { defaultImage } = productItem;

    if (defaultImage && defaultImage.url({ store: "small" })) {
      return defaultImage.url({ store: "small" });
    }
    return "/resources/placeholder.gif";
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
    const currentCartItemId = event.target.getAttribute("data-target");
    return Meteor.call("cart/removeFromCart", currentCartItemId);
  }

  render() {
    return (
      <CartItems
        items={this.props.productItems}
        pdpPath={this.pdpPath}
        handleLowInventory={this.handleLowInventory}
        handleImage={this.handleImage}
        handleBgImage={this.handleBgImage}
        handleRemoveItem={this.handleRemoveItem}
        {...this.props}
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

export default composeWithTracker(composer, Loading)(CartItemContainer);
