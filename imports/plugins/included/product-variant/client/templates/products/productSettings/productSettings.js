import _ from "lodash";
import { ReactiveDict } from "meteor/reactive-dict";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import { Media, Products } from "/lib/collections";
import { PublishContainer } from "/imports/plugins/core/revisions";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";
import { applyProductRevision } from "/lib/api/products";

Template.productSettings.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    products: [],
    productIds: []
  });

  this.autorun(() => {
    const currentData = Template.currentData();

    if (_.isArray(currentData.products)) {
      const productIds = currentData.products.map((product) => {
        return product._id;
      });

      const products = Products.find({
        _id: {
          $in: productIds
        }
      }).map((product) => {
        return applyProductRevision(product);
      });

      this.state.set("productIds", productIds);
      this.state.set("products", products);
    }
  });
});

Template.productSettings.helpers({
  PublishContainerComponent() {
    const instance = Template.instance();
    const productIds = instance.state.get("productIds") || [];

    return {
      component: PublishContainer,
      documentIds: productIds
    };
  },
  isVisible() {
    const instance = Template.instance();
    const products = instance.state.get("products") || [];

    // Use the first selected product to determin status of bulk, isVisible button
    if (Array.isArray(products) && products.length) {
      return products[0].isVisible;
    }

    return false;
  },
  hasSelectedProducts() {
    return this.products.length > 0;
  },
  itemWeightActive: function (weight) {
    const instance = Template.instance();
    const products = instance.state.get("products");
    const tag = ReactionProduct.getTag();

    for (const product of products) {
      const positions = product.positions && product.positions[tag] || {};
      const currentWeight = positions.weight || 0;
      if (currentWeight === weight) {
        return "active";
      }
    }
    return "";
  }
});

Template.productSettingsGridItem.helpers({
  displayPrice: function () {
    if (this._id) {
      return ReactionProduct.getProductPriceRange(this._id).range;
    }
    return null;
  },

  media: function () {
    const media = Media.findOne({
      "metadata.productId": this._id,
      "metadata.priority": 0,
      "metadata.toGrid": 1
    }, { sort: { uploadedAt: 1 } });

    return media instanceof FS.File ? media : false;
  },
  additionalMedia: function () {
    const mediaArray = Media.find({
      "metadata.productId": this._id,
      "metadata.priority": {
        $gt: 0
      },
      "metadata.toGrid": 1
    }, { limit: 3 });

    if (mediaArray.count() > 1) {
      return mediaArray;
    }
    return false;
  },
  weightClass: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    switch (weight) {
      case 1:
        return "product-medium";
      case 2:
        return "product-large";
      default:
        return "product-small";
    }
  },

  isMediumWeight: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    return weight === 1;
  },
  isLargeWeight: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    return weight === 3;
  },
  shouldShowAdditionalImages: function () {
    if (this.isMediumWeight && this.mediaArray) {
      return true;
    }
    return false;
  }
});

Template.productSettingsListItem.inheritsHelpersFrom("productSettingsGridItem");

/**
 * productExtendedControls events
 */

Template.productSettings.events({
  "click [data-event-action=publishProduct]": function () {
    const instance = Template.instance();
    const products = instance.state.get("products") || [];

    if (isRevisionControlEnabled()) {
      for (const product of products) {
        // Update the visibility using the first selected product to determine the proper
        // visibility toggle. This is to ensure that all selected products will become visible or not visible
        // at the same time so it's not confusing.
        Meteor.call("products/updateProductField", product._id, "isVisible", !products[0].isVisible);
      }
    } else {
      // The legacy behavior will bulk toggle visibilty of each product seperatly.
      //
      // Example:
      // If you selected 10 products, and 5 were visible and 5 were not visible, and then
      // clicked the visibility button, 5 products would switched from not visible to visible, and the other 5
      // would be swiched from visible to not visible.
      ReactionProduct.publishProduct(products);
    }
  },
  "click [data-event-action=cloneProduct]": function () {
    ReactionProduct.cloneProduct(this.products);
  },
  "click [data-event-action=deleteProduct]": function () {
    ReactionProduct.maybeDeleteProduct(this.products);
  },
  "click [data-event-action=changeProductWeight]": function (event) {
    event.preventDefault();
    const tag = ReactionProduct.getTag();
    for (const product of this.products) {
      const weight = $(event.currentTarget).data("event-data") || 0;
      const positions = {
        weight: weight,
        updatedAt: new Date()
      };
      /* eslint no-loop-func: 1 */
      //
      // TODO review Template.productSettings events for no-loop-func
      //
      Meteor.call("products/updateProductPosition", product._id, positions, tag,
        (error) => {
          if (error) {
            Logger.warn(error);
            throw new Meteor.Error(403, error);
          }
        }
      );
    }
  }
});
