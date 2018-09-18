import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { Catalog, getPrimaryMediaForItem, ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";

function updateVariantProductField(variants, field, value) {
  return variants.map((variant) => Meteor.call("products/updateProductField", variant._id, field, value));
}

/**
 * @summary Get the list of selected products
 * @returns {Object[]} Product documents
 */
function getSelectedProducts() {
  const productIds = Session.get("productGrid/selectedProducts");
  return Products.find({
    _id: {
      $in: productIds
    }
  }).fetch();
}

Template.productSettings.helpers({
  hasSelectedProducts() {
    const productIds = Session.get("productGrid/selectedProducts");
    return productIds && productIds.length > 0;
  },
  isVisible() {
    const products = getSelectedProducts();

    // Use the first selected product to determine status of bulk, isVisible button
    if (Array.isArray(products) && products.length) {
      return products[0].isVisible;
    }

    return false;
  },
  products() {
    return getSelectedProducts();
  }
});

Template.productSettingsListItem.events({
  "click [data-event-action=product-click]"() {
    Reaction.Router.go("product", {
      handle: (this.__published && this.__published.handle) || this.handle
    });

    Reaction.state.set("edit/focus", "productDetails");

    // Set actionView to product admin
    Reaction.setActionView({
      i18nKeyLabel: "productDetailEdit.productSettings",
      label: "Product Settings",
      template: "ProductAdmin"
    });
  }
});

Template.productSettingsListItem.helpers({
  displayPrice() {
    if (this._id) {
      return Catalog.getProductPriceRange(this._id).range;
    }
    return null;
  },

  mediaUrl() {
    const variants = ReactionProduct.getTopVariants(this._id);
    if (!variants || variants.length === 0) return "/resources/placeholder.gif";
    const media = getPrimaryMediaForItem({ productId: this._id, variantId: variants[0]._id });
    if (!media) return "/resources/placeholder.gif";
    return media.url({ store: "thumbnail" });
  },

  listItemActiveClassName(productId) {
    const { handle } = Reaction.Router.current().params;

    if (ReactionProduct.equals("productId", productId) && handle) {
      return "active";
    }

    return "";
  }
});

/**
 * productExtendedControls events
 */

Template.productSettings.events({
  "click [data-event-action=publishProduct]"() {
    const products = getSelectedProducts();

    for (const product of products) {
      // Update the visibility using the first selected product to determine the proper
      // visibility toggle. This is to ensure that all selected products will become visible or not visible
      // at the same time so it's not confusing.
      Meteor.call("products/updateProductField", product._id, "isVisible", !products[0].isVisible);
      // update the variants visibility
      const variants = Products.find({
        ancestors: product._id
      });
      updateVariantProductField(variants, "isVisible", !products[0].isVisible);
    }
  },
  "click [data-event-action=cloneProduct]"() {
    const products = getSelectedProducts();
    ReactionProduct.cloneProduct(products);
  },
  "click [data-event-action=archiveProduct]"() {
    const products = getSelectedProducts();
    ReactionProduct.archiveProduct(products);
  }
});
